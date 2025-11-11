const getConnection = (req, res) => {
    res.status(200).json({ ok: true, message: 'Servidor activo' });
};


module.exports = {getConnection};