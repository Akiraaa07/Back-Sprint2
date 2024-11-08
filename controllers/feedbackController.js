const db = require('../db/database');

exports.adicionarFeedback = (req, res) => {
    try {
        const { nota, comentario, data_feedback } = req.body;
        const id_paciente = req.user.id;
        const dataFeedback = data_feedback || new Date().toISOString();
        const status = 'pendente';

        console.log('Dados completos recebidos:', req.body);
        console.log('ID do paciente:', id_paciente);

        if (nota === undefined || nota === null) {
            return res.status(400).json({ error: 'Nota é obrigatória' });
        }

        if (!comentario || comentario.trim() === '') {
            return res.status(400).json({ error: 'Comentário é obrigatório' });
        }

        if (nota < 1 || nota > 5) {
            return res.status(400).json({ error: 'Nota deve estar entre 1 e 5' });
        }

        const sql = `
            INSERT INTO feedback (id_paciente, nota, comentario, data_feedback, status) 
            VALUES (?, ?, ?, ?, ?)
        `;

        const params = [id_paciente, nota, comentario, dataFeedback, status];
        console.log('SQL:', sql);
        console.log('Parâmetros:', params);

        db.run(sql, params, function(err) {
            if (err) {
                console.error('Erro ao inserir feedback:', err);
                return res.status(500).json({ 
                    error: err.message,
                    details: 'Erro ao inserir no banco de dados'
                });
            }
            
            const feedbackId = this.lastID;
            console.log('Feedback inserido com ID:', feedbackId);

            db.get(
                "SELECT * FROM feedback WHERE id = ?",
                [feedbackId],
                (err, row) => {
                    if (err) {
                        console.error('Erro ao buscar feedback inserido:', err);
                        return res.status(500).json({ error: err.message });
                    }
                    console.log('Feedback recuperado:', row);
                    res.status(201).json(row);
                }
            );
        });
    } catch (error) {
        console.error('Erro no controller de feedback:', error);
        res.status(500).json({ 
            error: error.message,
            stack: error.stack
        });
    }
};

exports.obterFeedbacks = (req, res) => {
    try {
        console.log('Requisição recebida para obter feedbacks');
        console.log('Usuário:', req.user);

        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'ID do usuário não encontrado' });
        }

        if (req.user.role === 'admin') {
            db.all(
                `SELECT f.*, u.username 
                 FROM feedback f 
                 JOIN usuarios u ON f.id_paciente = u.id 
                 ORDER BY f.data_feedback DESC`,
                [],
                (err, rows) => {
                    if (err) {
                        console.error('Erro ao buscar feedbacks:', err);
                        return res.status(500).json({ error: err.message });
                    }
                    console.log('Feedbacks encontrados:', rows);
                    res.status(200).json(rows);
                }
            );
        } else {
            db.all(
                `SELECT * FROM feedback WHERE id_paciente = ? ORDER BY data_feedback DESC`,
                [req.user.id],
                (err, rows) => {
                    if (err) {
                        console.error('Erro ao buscar feedbacks:', err);
                        return res.status(500).json({ error: err.message });
                    }
                    console.log('Feedbacks encontrados:', rows);
                    res.status(200).json(rows);
                }
            );
        }
    } catch (error) {
        console.error('Erro no controller de feedback:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.obterFeedbackPorId = (req, res) => {
    const { id } = req.params;
    const id_paciente = req.user.id;
    
    db.get(
        "SELECT * FROM feedback WHERE id = ? AND id_paciente = ?",
        [id, id_paciente],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (row) {
                res.status(200).json(row);
            } else {
                res.status(404).json({ error: 'Feedback não encontrado!' });
            }
        }
    );
};

exports.atualizarFeedback = (req, res) => {
    const { id } = req.params;
    const { nota, comentario } = req.body;
    const id_paciente = req.user.id;

    db.run(
        "UPDATE feedback SET nota = ?, comentario = ? WHERE id = ? AND id_paciente = ?",
        [nota, comentario, id, id_paciente],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes) {
                res.status(200).json({ message: 'Feedback atualizado com sucesso!' });
            } else {
                res.status(404).json({ error: 'Feedback não encontrado!' });
            }
        }
    );
};

exports.deletarFeedback = (req, res) => {
    const { id } = req.params;
    const id_paciente = req.user.id;

    db.run(
        "DELETE FROM feedback WHERE id = ? AND id_paciente = ?",
        [id, id_paciente],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes) {
                res.status(200).json({ message: 'Feedback removido com sucesso!' });
            } else {
                res.status(404).json({ error: 'Feedback não encontrado!' });
            }
        }
    );
};

exports.debugFeedbacks = (req, res) => {
    db.all("SELECT * FROM feedback", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({
            total: rows.length,
            feedbacks: rows
        });
    });
};

exports.atualizarStatusFeedback = (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                error: 'Apenas administradores podem atualizar o status do feedback' 
            });
        }

        if (!['aprovado', 'reprovado', 'pendente'].includes(status)) {
            return res.status(400).json({ 
                error: 'Status inválido. Use: aprovado, reprovado ou pendente' 
            });
        }

        db.run(
            "UPDATE feedback SET status = ? WHERE id = ?",
            [status, id],
            function(err) {
                if (err) {
                    console.error('Erro ao atualizar status:', err);
                    return res.status(500).json({ error: err.message });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ error: 'Feedback não encontrado' });
                }
                res.status(200).json({ 
                    message: 'Status do feedback atualizado com sucesso',
                    status: status
                });
            }
        );
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        res.status(500).json({ error: error.message });
    }
};