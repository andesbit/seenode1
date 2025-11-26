// ============================================
// 1. database/Database.js
// ============================================
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path'

const sqlite3Verbose = sqlite3.verbose();

class Database {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      console.log('Ruta absoluta que se intenta abrir:', path.resolve(this.dbPath));
      this.db = new sqlite3Verbose.Database(this.dbPath, (err) => {
        if (err) {
          console.error('❌ Error conectando a la base de datos:', err);
          reject(err);
        } else {
          console.log('✅ Base de datos conectada:', this.dbPath);
          
          // Habilitar foreign keys
          this.db.run('PRAGMA foreign_keys = ON');
          
          // Convertir métodos a promesas (PERO NO run)
          this.get = promisify(this.db.get.bind(this.db));
          this.all = promisify(this.db.all.bind(this.db));
          this.exec = promisify(this.db.exec.bind(this.db));
          
          resolve();
        }
      });
    });
  }

  // Método run personalizado que devuelve lastID
  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          // 'this' contiene lastID y changes
          resolve({
            lastID: this.lastID,
            changes: this.changes
          });
        }
      });
    });
  }

  async close() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
        return;
      }
      
      this.db.close((err) => {
        if (err) reject(err);
        else {
          console.log('✅ Base de datos cerrada');
          resolve();
        }
      });
    });
  }

  async transaction(callback) {
    await this.run('BEGIN TRANSACTION');
    
    try {
      const result = await callback(this);
      await this.run('COMMIT');
      return result;
    } catch (error) {
      await this.run('ROLLBACK');
      throw error;
    }
  }

  async backup(destino) {
    return new Promise((resolve, reject) => {
      const backup = this.db.backup(destino);
      
      backup.step(-1);
      backup.finish((err) => {
        if (err) reject(err);
        else {
          console.log(`✅ Backup creado: ${destino}`);
          resolve();
        }
      });
    });
  }
}

export default Database;