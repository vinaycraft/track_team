import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

function getDatabase(): Database.Database {
  if (!db) {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const dbPath = path.join(dataDir, 'locations.db');
    db = new Database(dbPath);

    // Initialize database schema
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'team')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    // Insert default admin if not exists
    const adminExists = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('admin') as { count: number };
    if (adminExists.count === 0) {
      db.prepare('INSERT INTO users (name, role) VALUES (?, ?)').run('Admin', 'admin');
    }
  }
  
  return db;
}

export interface User {
  id: number;
  name: string;
  role: 'admin' | 'team';
  created_at: string;
}

export interface Location {
  id: number;
  user_id: number;
  latitude: number;
  longitude: number;
  updated_at: string;
}

export const dbOperations = {
  // User operations
  getAllUsers: () => {
    const database = getDatabase();
    return database.prepare('SELECT * FROM users').all() as User[];
  },
  
  getUserById: (id: number) => {
    const database = getDatabase();
    return database.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
  },
  
  createUser: (name: string, role: 'admin' | 'team') => {
    const database = getDatabase();
    const stmt = database.prepare('INSERT INTO users (name, role) VALUES (?, ?)');
    const result = stmt.run(name, role);
    return result.lastInsertRowid as number;
  },

  // Location operations
  updateLocation: (userId: number, latitude: number, longitude: number) => {
    const database = getDatabase();
    const stmt = database.prepare(`
      INSERT INTO locations (user_id, latitude, longitude)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        latitude = excluded.latitude,
        longitude = excluded.longitude,
        updated_at = CURRENT_TIMESTAMP
    `);
    stmt.run(userId, latitude, longitude);
  },

  getAllLocations: () => {
    const database = getDatabase();
    const stmt = database.prepare(`
      SELECT l.*, u.name, u.role
      FROM locations l
      JOIN users u ON l.user_id = u.id
      ORDER BY l.updated_at DESC
    `);
    return stmt.all() as (Location & { name: string; role: string })[];
  },

  getLocationByUserId: (userId: number) => {
    const database = getDatabase();
    const stmt = database.prepare(`
      SELECT l.*, u.name, u.role
      FROM locations l
      JOIN users u ON l.user_id = u.id
      WHERE l.user_id = ?
    `);
    return stmt.get(userId) as (Location & { name: string; role: string }) | undefined;
  },
};

export default getDatabase;
