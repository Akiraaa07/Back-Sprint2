const db = require('../db/database');

exports.registrarSintoma = (req, res) => {
    const { descricao, intensidade } = req.body;
    const id_usuario = req.user.id;
    const data_registro = new Date().toISOString();
    const status = 'pendente';

    if (!descricao || descricao.trim() === '') {
        return res.status(400).json({ error: 'Descrição é obrigatória' });
    }

    if (!intensidade || intensidade < 1 || intensidade > 5) {
        return res.status(400).json({ error: 'Intensidade deve estar entre 1 e 5' });
    }

    db.run(
        "INSERT INTO sintomas (id_usuario, descricao, intensidade, data_registro, status) VALUES (?, ?, ?, ?, ?)",
        [id_usuario, descricao, intensidade, data_registro, status],
        function(err) {
            if (err) {
                console.error('Erro ao registrar sintoma:', err);
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({
                id: this.lastID,
                descricao,
                intensidade,
                data_registro,
                status
            });
        }
    );
};

exports.listarSintomas = (req, res) => {
    const query = req.user.role === 'admin' 
        ? `SELECT s.*, u.username 
           FROM sintomas s 
           JOIN usuarios u ON s.id_usuario = u.id 
           ORDER BY s.data_registro DESC`
        : "SELECT * FROM sintomas WHERE id_usuario = ? ORDER BY data_registro DESC";

    const params = req.user.role === 'admin' ? [] : [req.user.id];

    db.all(query, params, (err, sintomas) => {
        if (err) {
            console.error('Erro ao listar sintomas:', err);
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(sintomas);
    });
};

exports.atualizarStatusSintoma = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            error: 'Apenas administradores podem atualizar o status do sintoma' 
        });
    }

    if (!['aprovado', 'reprovado', 'pendente'].includes(status)) {
        return res.status(400).json({ 
            error: 'Status inválido. Use: aprovado, reprovado ou pendente' 
        });
    }

    db.run(
        "UPDATE sintomas SET status = ? WHERE id = ?",
        [status, id],
        function(err) {
            if (err) {
                console.error('Erro ao atualizar status do sintoma:', err);
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Sintoma não encontrado' });
            }
            res.status(200).json({ 
                message: 'Status do sintoma atualizado com sucesso',
                status: status
            });
        }
    );
};

exports.obterSintomaPorId = (req, res) => {
    const { id } = req.params;
    
    const query = req.user.role === 'admin' 
        ? `SELECT s.*, u.username 
           FROM sintomas s 
           JOIN usuarios u ON s.id_usuario = u.id 
           WHERE s.id = ?`
        : "SELECT * FROM sintomas WHERE id = ? AND id_usuario = ?";

    const params = req.user.role === 'admin' ? [id] : [id, req.user.id];

    db.get(query, params, (err, sintoma) => {
        if (err) {
            console.error('Erro ao buscar sintoma:', err);
            return res.status(500).json({ error: err.message });
        }
        if (!sintoma) {
            return res.status(404).json({ error: 'Sintoma não encontrado' });
        }
        res.status(200).json(sintoma);
    });
};

exports.atualizarSintoma = (req, res) => {
    const { id } = req.params;
    const { descricao, intensidade } = req.body;

    if (!descricao || descricao.trim() === '') {
        return res.status(400).json({ error: 'Descrição é obrigatória' });
    }

    if (!intensidade || intensidade < 1 || intensidade > 5) {
        return res.status(400).json({ error: 'Intensidade deve estar entre 1 e 5' });
    }

    db.run(
        "UPDATE sintomas SET descricao = ?, intensidade = ? WHERE id = ? AND id_usuario = ?",
        [descricao, intensidade, id, req.user.id],
        function(err) {
            if (err) {
                console.error('Erro ao atualizar sintoma:', err);
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Sintoma não encontrado!' });
            }
            res.status(200).json({ message: "Sintoma atualizado com sucesso!" });
        }
    );
};
exports.deletarSintoma = (req, res) => {
    const { id } = req.params;

    db.run(
        "DELETE FROM sintomas WHERE id = ? AND id_usuario = ?",
        [id, req.user.id],
        function(err) {
            if (err) {
                console.error('Erro ao excluir sintoma:', err);
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Sintoma não encontrado!' });
            }
            res.status(200).json({ message: "Sintoma excluído com sucesso!" });
        }
    );
};
