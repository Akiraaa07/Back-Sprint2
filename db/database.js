const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database(path.join(__dirname, '../lista-feedback.db'));

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_paciente INTEGER,
      nota INTEGER CHECK(nota >= 1 AND nota <= 5),
      comentario TEXT,
      data_feedback TEXT,
      status TEXT DEFAULT 'pendente',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(id_paciente) REFERENCES usuarios(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sintomas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_usuario INTEGER,
      descricao TEXT,
      intensidade INTEGER CHECK(intensidade >= 1 AND intensidade <= 5),
      data_registro TEXT,
      status TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(id_usuario) REFERENCES usuarios(id)
    )
  `);

  db.get("SELECT * FROM usuarios WHERE username = 'admin'", [], (err, adminRow) => {
    if (err) {
      console.error('Erro ao verificar usuário admin:', err);
      return;
    }

    if (!adminRow) {
      bcrypt.hash('admin123', 10, (err, hashedPassword) => {
        if (err) {
          console.error('Erro ao criar hash da senha do admin:', err);
          return;
        }

        db.run(
          "INSERT INTO usuarios (username, password, role) VALUES (?, ?, ?)",
          ['admin', hashedPassword, 'admin'],
          function(err) {
            if (err) {
              console.error('Erro ao criar usuário admin:', err);
            } else {
              console.log('Usuário admin criado com sucesso!');
            }
          }
        );
      });
    }
  });

  db.get("SELECT * FROM usuarios WHERE username = 'teste'", [], (err, row) => {
    if (err) {
      console.error('Erro ao verificar usuário teste:', err);
      return;
    }

    if (!row) {
      bcrypt.hash('123456', 10, (err, hashedPassword) => {
        if (err) {
          console.error('Erro ao criar hash da senha:', err);
          return;
        }

        db.run(
          "INSERT INTO usuarios (username, password, role) VALUES (?, ?, ?)",
          ['teste', hashedPassword, 'paciente'],
          function(err) {
            if (err) {
              console.error('Erro ao criar usuário teste:', err);
            } else {
              console.log('Usuário teste criado com sucesso!');
            }
          }
        );
      });
    }
  });
});

db.on('error', (err) => {
  console.error('Erro no banco de dados:', err);
});

module.exports = db;