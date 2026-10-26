SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'AspNetUsers'
  AND indexname = 'EmailIndex';