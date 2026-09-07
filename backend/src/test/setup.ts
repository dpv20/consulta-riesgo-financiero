/**
 * Variables de entorno para las pruebas.
 *
 * Se fijan acá, y no en un `.env`, para que la suite corra en cualquier máquina o en CI
 * sin depender de un archivo que no está versionado. `dotenv` no sobrescribe valores ya
 * presentes, así que estos ganan.
 */
process.env.JWT_SECRET ??= 'secreto-solo-para-pruebas'
process.env.JWT_EXPIRES_IN ??= '15m'
process.env.CORS_ORIGIN ??= 'http://localhost:5173'
