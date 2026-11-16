-- ChurchManager - compatibilidade com o banco MySQL compartilhado do TCC
-- Execute UMA ÚNICA VEZ no banco GestaoIgrejaTCC depois de importar/aplicar a migration original do grupo.
-- Faça backup antes de executar. O script é aditivo: preserva Igreja, Usuario, Cargo, Doacao,
-- Evento, Escala, Permissao, Presenca_Evento e Participacao_Escala.

USE GestaoIgrejaTCC;

-- Dados institucionais usados nas configurações do ChurchManager.
ALTER TABLE Igreja
  ADD COLUMN Email VARCHAR(254) NOT NULL DEFAULT '',
  ADD COLUMN Telefone VARCHAR(40) NOT NULL DEFAULT '',
  ADD COLUMN CreatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6);

-- O ChurchManager guarda a função de autorização em Perfil e mantém o vínculo legado IdCargo.
ALTER TABLE Usuario
  MODIFY COLUMN Email VARCHAR(254) NOT NULL,
  ADD COLUMN Perfil VARCHAR(80) NOT NULL DEFAULT 'Membro',
  ADD COLUMN CreatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6);

-- Campos complementares do módulo de cargos/permissões, mantendo Permissao e Cargo existentes.
ALTER TABLE Cargo
  ADD COLUMN Descricao VARCHAR(500) NOT NULL DEFAULT '',
  ADD COLUMN PermissoesJson LONGTEXT NULL,
  ADD COLUMN QuantidadeUsuarios INT NOT NULL DEFAULT 0,
  ADD COLUMN CreatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6);

UPDATE Cargo SET PermissoesJson = '[]' WHERE PermissoesJson IS NULL OR PermissoesJson = '';
ALTER TABLE Cargo MODIFY COLUMN PermissoesJson LONGTEXT NOT NULL;

-- Impede que a exclusão de um cargo apague contas de usuário vinculadas.
ALTER TABLE Usuario DROP FOREIGN KEY FK_Usuario_Cargo_IdCargo;
ALTER TABLE Usuario
  ADD CONSTRAINT FK_Usuario_Cargo_IdCargo
    FOREIGN KEY (IdCargo) REFERENCES Cargo(IdCargo) ON DELETE RESTRICT;

-- Preserva os campos originais de Evento e acrescenta os dados usados pela interface.
ALTER TABLE Evento
  ADD COLUMN Ministerio VARCHAR(120) NOT NULL DEFAULT 'Todos',
  ADD COLUMN Status VARCHAR(40) NOT NULL DEFAULT 'Planejado',
  ADD COLUMN CreatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6);

UPDATE Evento SET Descricao = '' WHERE Descricao IS NULL;
UPDATE Evento SET Local = '' WHERE Local IS NULL;
ALTER TABLE Evento
  MODIFY COLUMN Descricao LONGTEXT NOT NULL,
  MODIFY COLUMN Local VARCHAR(255) NOT NULL DEFAULT '';

-- Enriquece Escala sem apagar nem recriar as escalas já cadastradas.
ALTER TABLE Escala
  ADD COLUMN IdIgreja INT NULL,
  ADD COLUMN Titulo VARCHAR(180) NOT NULL DEFAULT '',
  ADD COLUMN Ministerio VARCHAR(120) NOT NULL DEFAULT '',
  ADD COLUMN DataHora DATETIME(6) NULL,
  ADD COLUMN MembrosJson LONGTEXT NULL,
  ADD COLUMN Status VARCHAR(40) NOT NULL DEFAULT 'Pendente',
  ADD COLUMN CreatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6);

UPDATE Escala s
JOIN Evento e ON e.IdEvento = s.IdEvento
SET
  s.IdIgreja = e.IdIgreja,
  s.Titulo = s.NomeMinisterio,
  s.Ministerio = s.NomeMinisterio,
  s.DataHora = e.DataHora
WHERE s.IdIgreja IS NULL;

UPDATE Escala
SET
  Titulo = CASE WHEN Titulo = '' THEN NomeMinisterio ELSE Titulo END,
  Ministerio = CASE WHEN Ministerio = '' THEN NomeMinisterio ELSE Ministerio END,
  DataHora = COALESCE(DataHora, CURRENT_TIMESTAMP(6)),
  MembrosJson = CASE WHEN MembrosJson IS NULL OR MembrosJson = '' THEN '[]' ELSE MembrosJson END;

ALTER TABLE Escala
  MODIFY COLUMN IdIgreja INT NOT NULL,
  MODIFY COLUMN DataHora DATETIME(6) NOT NULL,
  MODIFY COLUMN MembrosJson LONGTEXT NOT NULL;

-- O vínculo com Evento passa a ser opcional para permitir escalas independentes.
ALTER TABLE Escala DROP FOREIGN KEY FK_Escala_Evento_IdEvento;
ALTER TABLE Escala
  MODIFY COLUMN IdEvento INT NULL,
  ADD CONSTRAINT FK_Escala_Evento_IdEvento
    FOREIGN KEY (IdEvento) REFERENCES Evento(IdEvento) ON DELETE SET NULL,
  ADD CONSTRAINT FK_Escala_Igreja_IdIgreja
    FOREIGN KEY (IdIgreja) REFERENCES Igreja(IdIgreja) ON DELETE CASCADE,
  ADD INDEX IX_Escala_IdIgreja (IdIgreja),
  ADD INDEX IX_Escala_IdIgreja_DataHora (IdIgreja, DataHora);

-- Cadastro administrativo de membros separado das contas de autenticação Usuario.
CREATE TABLE Membro (
  IdMembro INT NOT NULL AUTO_INCREMENT,
  IdIgreja INT NOT NULL,
  Nome VARCHAR(160) NOT NULL,
  Email VARCHAR(254) NOT NULL DEFAULT '',
  Telefone VARCHAR(40) NOT NULL DEFAULT '',
  Ministerio VARCHAR(120) NOT NULL DEFAULT '',
  Status VARCHAR(40) NOT NULL DEFAULT 'Ativo',
  Cargo VARCHAR(80) NOT NULL DEFAULT 'Membro',
  CreatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (IdMembro),
  INDEX IX_Membro_IdIgreja (IdIgreja),
  CONSTRAINT FK_Membro_Igreja_IdIgreja
    FOREIGN KEY (IdIgreja) REFERENCES Igreja(IdIgreja) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ministérios são independentes dos cargos e das permissões.
CREATE TABLE Ministerio (
  IdMinisterio INT NOT NULL AUTO_INCREMENT,
  IdIgreja INT NOT NULL,
  Nome VARCHAR(160) NOT NULL,
  Descricao VARCHAR(500) NOT NULL DEFAULT '',
  Coordenador VARCHAR(160) NOT NULL DEFAULT '',
  Status VARCHAR(40) NOT NULL DEFAULT 'Ativo',
  CreatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (IdMinisterio),
  INDEX IX_Ministerio_IdIgreja (IdIgreja),
  CONSTRAINT FK_Ministerio_Igreja_IdIgreja
    FOREIGN KEY (IdIgreja) REFERENCES Igreja(IdIgreja) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Entradas e saídas do controle financeiro. Doacao continua preservada para contribuições.
CREATE TABLE MovimentacaoFinanceira (
  IdMovimentacao INT NOT NULL AUTO_INCREMENT,
  IdIgreja INT NOT NULL,
  Descricao VARCHAR(180) NOT NULL,
  Categoria VARCHAR(100) NOT NULL DEFAULT 'Outros',
  Valor DECIMAL(12,2) NOT NULL,
  Tipo VARCHAR(30) NOT NULL DEFAULT 'Income',
  DataMovimentacao DATETIME(6) NOT NULL,
  Metodo VARCHAR(50) NOT NULL DEFAULT 'PIX',
  CreatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (IdMovimentacao),
  INDEX IX_MovimentacaoFinanceira_IdIgreja (IdIgreja),
  INDEX IX_MovimentacaoFinanceira_IdIgreja_Data (IdIgreja, DataMovimentacao),
  CONSTRAINT FK_MovimentacaoFinanceira_Igreja_IdIgreja
    FOREIGN KEY (IdIgreja) REFERENCES Igreja(IdIgreja) ON DELETE CASCADE,
  CONSTRAINT CK_MovimentacaoFinanceira_Valor CHECK (Valor > 0),
  CONSTRAINT CK_MovimentacaoFinanceira_Tipo CHECK (Tipo IN ('Income', 'Expense'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sincroniza a função usada na autorização com o nome do cargo já relacionado ao usuário.
UPDATE Usuario u
JOIN Cargo c ON c.IdCargo = u.IdCargo
SET u.Perfil = c.Nome
WHERE u.Perfil = 'Membro' AND c.Nome <> '';

-- Recomenda-se conferir duplicidades antes de impor unicidade a e-mails existentes:
-- SELECT Email, COUNT(*) FROM Usuario GROUP BY Email HAVING COUNT(*) > 1;
-- Se não houver duplicidades, crie o índice único:
-- ALTER TABLE Usuario ADD UNIQUE KEY UX_Usuario_Email (Email);
