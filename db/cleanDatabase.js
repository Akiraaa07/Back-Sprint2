const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../lista-feedback.db'));

db.serialize(() => {
  db.run("DROP TABLE IF EXISTS feedbacks", (err) => {
    if (err) {
      console.error('Erro ao dropar tabela feedbacks:', err);
    } else {
      console.log('Tabela feedbacks removida com sucesso');
    }
  });

  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='feedback'", (err, row) => {
    if (err) {
      console.error('Erro ao verificar tabela feedback:', err);
    } else {
      console.log('Status da tabela feedback:', row ? 'Existe' : 'Não existe');
    }
  });

  db.run("DELETE FROM feedback", (err) => {
    if (err) {
      console.error('Erro ao limpar tabela feedback:', err);
    } else {
      console.log('Tabela feedback limpa com sucesso');
    }
  });

});

db.close((err) => {
  if (err) {
    console.error('Erro ao fechar conexão:', err);
  } else {
    console.log('Limpeza concluída');
  }
}); 