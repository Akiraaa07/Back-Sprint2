const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');

exports.registerUser = (req, res) => {
  const { 
    username, 
    password, 
    nome_completo, 
    cpf, 
    email, 
    telefone, 
    data_nascimento 
  } = req.body;

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: err.message });

    db.serialize(() => {
      db.run(
        "INSERT INTO usuarios (username, password, role) VALUES (?, ?, ?)",
        [username, hashedPassword, 'paciente'],
        function(err) {
          if (err) {
            console.error('Erro ao criar usuário:', err);
            return res.status(500).json({ error: 'Erro ao criar usuário' });
          }

          const userId = this.lastID;

          db.run(
            "INSERT INTO pacientes (id_usuario, nome_completo, cpf, email, telefone, data_nascimento) VALUES (?, ?, ?, ?, ?, ?)",
            [userId, nome_completo, cpf, email, telefone, data_nascimento],
            function(err) {
              if (err) {
                console.error('Erro ao criar paciente:', err);
                return res.status(500).json({ error: 'Erro ao criar paciente' });
              }

              res.status(201).json({ 
                message: 'Usuário e paciente registrados com sucesso!',
                userId: userId,
                pacienteId: this.lastID
              });
            }
          );
        }
      );
    });
  });
};

exports.loginUser = (req, res) => {
  const { username, password } = req.body;

  console.log('Tentativa de login para usuário:', username);

  db.get(`
    SELECT u.*, p.id as paciente_id, p.nome_completo 
    FROM usuarios u 
    LEFT JOIN pacientes p ON p.id_usuario = u.id 
    WHERE u.username = ?
  `, [username], (err, user) => {
    if (err) {
      console.error('Erro ao buscar usuário:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    if (!user) {
      console.log('Usuário não encontrado:', username);
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err || !isMatch) {
        console.log('Senha incorreta para usuário:', username);
        return res.status(401).json({ error: 'Usuário ou senha inválidos' });
      }

      const token = jwt.sign(
        { 
          id: user.id,
          paciente_id: user.paciente_id,
          role: user.role,
          username: user.username 
        }, 
        'chave-secreta', 
        { expiresIn: '24h' }
      );

      console.log('Login bem-sucedido para usuário:', username);

      res.status(200).json({ 
        token,
        user: {
          id: user.id,
          paciente_id: user.paciente_id,
          username: user.username,
          nome_completo: user.nome_completo,
          role: user.role
        }
      });
    });
  });
};

exports.getUsers = (req, res) => {
  db.all("SELECT id, username, role FROM pacientes", (err, users) => {
    if (err) {
      console.error('Erro ao buscar usuários:', err);
      return res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
    res.status(200).json(users);
  });
};

exports.getUserById = (req, res) => {
  const { id } = req.params;

  db.get("SELECT id, username, role FROM pacientes WHERE id = ?", [id], (err, user) => {
    if (err) {
      console.error('Erro ao buscar usuário:', err);
      return res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.status(200).json(user);
  });
};

exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { username, password, role } = req.body;

  if (password) {
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return res.status(500).json({ error: err.message });

      db.run(
        "UPDATE pacientes SET username = ?, password = ?, role = ? WHERE id = ?",
        [username, hashedPassword, role, id],
        function(err) {
          if (err) {
            console.error('Erro ao atualizar usuário:', err);
            return res.status(500).json({ error: 'Erro ao atualizar usuário' });
          }
          if (this.changes) {
            return res.status(200).json({ message: 'Usuário atualizado com sucesso' });
          }
          res.status(404).json({ error: 'Usuário não encontrado' });
        }
      );
    });
  } else {
    db.run(
      "UPDATE pacientes SET username = ?, role = ? WHERE id = ?",
      [username, role, id],
      function(err) {
        if (err) {
          console.error('Erro ao atualizar usuário:', err);
          return res.status(500).json({ error: 'Erro ao atualizar usuário' });
        }
        if (this.changes) {
          return res.status(200).json({ message: 'Usuário atualizado com sucesso' });
        }
        res.status(404).json({ error: 'Usuário não encontrado' });
      }
    );
  }
};

exports.deleteUser = (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM pacientes WHERE id = ?", [id], function(err) {
    if (err) {
      console.error('Erro ao deletar usuário:', err);
      return res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
    if (this.changes) {
      return res.status(200).json({ message: 'Usuário deletado com sucesso' });
    }
    res.status(404).json({ error: 'Usuário não encontrado' });
  });
};