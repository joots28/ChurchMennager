-- Execute UMA VEZ em bancos existentes que ainda usam IX_Users_ChurchId_Email.
-- Primeiro confira se não há o mesmo e-mail associado a igrejas diferentes:
-- SELECT LOWER(Email) AS EmailNormalizado, COUNT(*) AS Quantidade
-- FROM Users GROUP BY LOWER(Email) HAVING COUNT(*) > 1;
-- Resolva duplicatas manualmente antes de continuar; não exclua contas automaticamente.
ALTER TABLE Users
  DROP INDEX IX_Users_ChurchId_Email,
  ADD UNIQUE KEY IX_Users_Email (Email);
