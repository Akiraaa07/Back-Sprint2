const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        console.log('Headers recebidos:', req.headers);
        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            console.log('Nenhum header de autorização fornecido');
            return res.status(403).json({ error: 'Nenhum token fornecido!' });
        }

        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.slice(7) 
            : authHeader;

        console.log('Token extraído:', token);

        jwt.verify(token, 'chave-secreta', (err, decoded) => {
            if (err) {
                console.log('Erro na verificação do token:', err);
                return res.status(401).json({ error: 'Token inválido!' });
            }

            console.log('Token decodificado:', decoded);
            req.user = decoded;
            next();
        });
    } catch (error) {
        console.error('Erro no middleware de autenticação:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

module.exports = authMiddleware;