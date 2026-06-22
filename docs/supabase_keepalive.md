# Supabase keepalive

Bu repo, Free Plan Supabase projesinin inaktivite nedeniyle pause olma riskini azaltmak icin hafif bir GitHub Actions keepalive workflow'u icerir.

## Kurulum

GitHub reposunda `Settings > Secrets and variables > Actions > New repository secret` bolumune sunlari ekleyin:

- `SUPABASE_URL`: Supabase project URL, ornek `https://lqgpdgeuvjydqvlihnyh.supabase.co`
- `SUPABASE_ANON_KEY`: Supabase anon/public API key

Workflow dosyasi:

- `.github/workflows/supabase-keepalive.yml`

## Nasil calisir?

Haftada iki kez `hastalar` tablosundan yalnizca 1 kayit okuyan hafif bir REST istegi atar:

```text
/rest/v1/hastalar?select=hasta_id&limit=1
```

Yazma, silme veya schema degisikligi yapmaz.

## Sinirlar

Supabase dokumanlari Free Plan projelerin dusuk aktivitede pause edilebilecegini, Pro Plan'in bunu garanti olarak engelledigini soyler. Bu workflow pause riskini azaltir ama resmi garanti degildir. Klinik veri icin ayrica duzenli manuel export veya Postgres dump yedegi alinmasi onerilir.
