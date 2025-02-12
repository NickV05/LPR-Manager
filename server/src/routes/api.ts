import express, { Request, Response } from "express";
import pool from "../db/database";
import stringSimilarity from "string-similarity";

const router = express.Router();

router.post("/lpr", async (req: Request, res: Response) => {
  const { plate_number, event_type, metadata } = req.body;

  if (!plate_number || !event_type) {
    console.log("Missing required fields in request body", {
      plate_number,
      event_type,
    });
    res
      .status(400)
      .json({ error: "Plate number and event type are required." });
      return
  }

  const similarPlatesQuery = `
  SELECT plate_number
  FROM lpr_events;
`;

  try {
    const allPlatesResult = await pool.query(similarPlatesQuery);
    const allPlates = allPlatesResult.rows.map((row) => row.plate_number);

    const matches = allPlates
      .map((plate) => ({
        plate_number: plate,
        similarity: stringSimilarity.compareTwoStrings(plate, plate_number),
      }))
      .filter((match) => match.similarity > 0.8)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    if (matches.length > 0) {
      console.log("Potentially similar plate numbers detected", {
        input: plate_number,
        matches,
      });
    }

    const duplicateCheckQuery = `
    SELECT * FROM lpr_events
    WHERE plate_number = $1 AND event_type = $2
      AND DATE_TRUNC('minute', event_time) = DATE_TRUNC('minute', NOW());
  `;

    const duplicateCheckResult = await pool.query(duplicateCheckQuery, [
      plate_number,
      event_type,
    ]);

    if (duplicateCheckResult.rows.length > 0) {
      console.log("Duplicate event detected", { plate_number, event_type });
      res.status(400).json({
        error: "Duplicate event detected. Please avoid repeated submissions.",
      });
      return
    }

    if (event_type === "entry") {
      const checkEntryQuery = `
        SELECT * FROM lpr_sessions
        WHERE plate_number = $1 AND session_end IS NULL;
      `;
      const entryCheckResult = await pool.query(checkEntryQuery, [
        plate_number,
      ]);

      if (entryCheckResult.rows.length > 0) {
        console.log("Entry already exists for this plate number", {
          plate_number,
        });
        res.status(400).json({
          error: "Entry for this record already happened.",
        });
        return
      }

      const eventQuery = `
        INSERT INTO lpr_events (plate_number, event_type, event_time, metadata)
        VALUES ($1, $2, NOW(), $3)
        RETURNING id, plate_number, event_type, event_time, metadata;
      `;
      const eventResult = await pool.query(eventQuery, [
        plate_number,
        event_type,
        metadata || {},
      ]);

      const sessionQuery = `
        INSERT INTO lpr_sessions (plate_number, session_start, metadata)
        VALUES ($1, NOW(), $2)
        RETURNING *;
      `;
      const sessionResult = await pool.query(sessionQuery, [
        plate_number,
        metadata || {},
      ]);

      console.log("Entry event successfully recorded", {
        event: eventResult.rows[0],
        session: sessionResult.rows[0],
      });

      res.status(201).json({
        event: eventResult.rows[0],
        session: sessionResult.rows[0],
      });
      return
    } else if (event_type === "exit") {
      const checkExitQuery = `
        SELECT * FROM lpr_sessions
        WHERE plate_number = $1 AND session_end IS NULL;
      `;
      const sessionCheckResult = await pool.query(checkExitQuery, [
        plate_number,
      ]);

      if (sessionCheckResult.rows.length === 0) {
        console.log("Exit cannot be recorded without prior entry", {
          plate_number,
        });
        res.status(400).json({
          error: "Exit cannot be recorded, entry has to happen first.",
        });
        return
      }

      const eventQuery = `
        INSERT INTO lpr_events (plate_number, event_type, event_time, metadata)
        VALUES ($1, $2, NOW(), $3)
        RETURNING id, plate_number, event_type, event_time, metadata;
      `;
      const eventResult = await pool.query(eventQuery, [
        plate_number,
        event_type,
        metadata || {},
      ]);

      const sessionQuery = `
        UPDATE lpr_sessions
        SET session_end = NOW(), metadata = metadata || $1
        WHERE plate_number = $2 AND session_end IS NULL
        RETURNING *;
      `;
      const sessionResult = await pool.query(sessionQuery, [
        metadata || {},
        plate_number,
      ]);

      if (sessionResult.rows.length > 0) {
        console.log("Exit event successfully recorded", {
          event: eventResult.rows[0],
          session: sessionResult.rows[0],
        });
        res.status(201).json({
          event: eventResult.rows[0],
          session: sessionResult.rows[0],
        });
        return
      } else {
        console.log("Session not found or already ended", { plate_number });
        res.status(404).json({ error: "Session not found or already ended." });
        return
      }
    } else {
      console.log("Invalid event type provided", { event_type });
      res.status(400).json({ error: "Invalid event type." });
      return
    }
  } catch (err) {
    console.log("Error processing event", { error: err });
    res.status(500).json({ error: "Internal Server Error" });
    return
  }
});

router.get("/lpr/history", async (_, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM lpr_events ORDER BY event_time DESC;"
    );
    console.log("Fetched history of LPR events");
    res.status(200).json(result.rows);
    return
  } catch (err) {
    console.log("Error fetching history of LPR events", { error: err });
    res.status(500).json({ error: "Internal Server Error" });
    return
  }
});

export default router;
