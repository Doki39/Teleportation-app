import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";
import { recognizeCarFromImage } from "../models/gpt_mini_api.js";
import { pool } from "../data/dbconnection.js";
import { body, validationResult } from "express-validator";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
const CARS_DIR = path.join(UPLOADS_DIR, "cars");
const KEYS_DIR = path.join(UPLOADS_DIR, "keys");

const carsStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, CARS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = (file.mimetype && file.mimetype.split("/")[1]) || "jpg";
    cb(null, `${nanoid()}.${ext}`);
  },
});

const keysStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, KEYS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = (file.mimetype && file.mimetype.split("/")[1]) || "jpg";
    cb(null, `${nanoid()}.${ext}`);
  },
});

const uploadCars = multer({ storage: carsStorage });
const uploadKeys = multer({ storage: keysStorage });
const router = express.Router();

router.get("/", async (req,res) => {
  try{
    const { rows } = await pool.query(`SELECT * FROM cars ORDER BY created_at DESC`);

    console.log(rows);
    return res.json(rows);
  } catch(err){
    res.status(500).json({message: "Failed to fetch cars"})
  }
}) 

router.post("/keyUrl", uploadKeys.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No photo sent" });

    const keyImageUrl = "/uploads/keys/" + req.file.filename;
    return res.json(keyImageUrl);
  } catch (err) {
    console.log(err);
    res.status(500).json({message: err.message})
  }
});

router.post("/analyze", uploadCars.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No photo sent" });

    const imageBuffer = await fs.readFile(req.file.path);
    const result = await recognizeCarFromImage(imageBuffer);

    const hasLicensePlate =
      result.licensePlate && String(result.licensePlate).trim() !== "";

    if (hasLicensePlate) {
      const imageUrl = "/uploads/cars/" + req.file.filename;
      return res.json({ carData: result, imageUrl });
    }

    await fs.unlink(req.file.path);
    res.json({ carData: result });
  } catch (err) {
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (_) {}
    }
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/save", [
  body("licensePlate").notEmpty(),
  body("imageUrl").notEmpty(),
],
  async(req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({errors: errors.array()})

    }
    const { licensePlate, make, model, carColor, country, imageUrl, roomNumber, keyImageUrl, note} = req.body;

  
    const insertQuery = `
      INSERT INTO cars (licence_plate, make, color, image_url, model, country, room_number, key_url, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
    const values = [licensePlate, make, carColor, imageUrl, model, country, roomNumber, keyImageUrl, note];

    try {
      const { rows } = await pool.query(insertQuery, values);
      const car = rows[0];
      return res.status(201).json({ message: "Car details saved", car});
    }catch(error){
      res.status(500).json({error: error.message})
  }
})

router.patch(
  "/",
  [body("licencePlate").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { licencePlate, notes, roomNumber } = req.body;
    try {
      const { rows } = await pool.query(
        "UPDATE cars SET notes = $1, room_number = $2 WHERE licence_plate = $3 RETURNING *",
        [notes ?? null, roomNumber ?? null, licencePlate]
      );
      const updated = rows[0];
      if (!updated) {
        return res.status(404).json({ message: "Car not found" });
      }
      return res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update notes and room number" });
    }
  }
);

export default router;
