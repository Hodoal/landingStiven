# MongoDB Local Setup

## Instalación

### macOS (con Homebrew)

```bash
# Instalar MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Iniciar el servicio
brew services start mongodb-community

# Verificar que está corriendo
mongo --version
```

### Windows

1. Descarga el installer de [MongoDB Community](https://www.mongodb.com/try/download/community)
2. Ejecuta el installer y sigue las instrucciones
3. MongoDB se instalará como servicio

### Linux (Ubuntu)

```bash
# Importar la clave GPG
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -

# Agregar repositorio
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list

# Instalar
sudo apt-get update
sudo apt-get install -y mongodb-org

# Iniciar
sudo systemctl start mongod
```

## Usando Docker (Recomendado para Desarrollo)

```bash
# Descargar imagen de MongoDB
docker pull mongo

# Crear container
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:latest

# Verificar que está corriendo
docker ps

# Ver logs
docker logs mongodb
```

## Conectar a MongoDB

### Con MongoDB Shell

```bash
# Local sin autenticación
mongosh

# Con autenticación
mongosh "mongodb://admin:password@localhost:27017"

# Comandos útiles
show databases
use stivenads
show collections
db.bookings.find()
```

### Desde Node.js

La conexión se configura automáticamente en `backend/server.js`:

```javascript
mongoose.connect(process.env.MONGODB_URI)
```

## MongoDB Atlas (Cloud)

Para usar MongoDB en la nube:

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta gratuita
3. Crea un cluster
4. Obtén la cadena de conexión
5. Actualiza `.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stivenads
```

## Hacer Backup

### Local

```bash
# Backup
mongodump --out ./backup

# Restaurar
mongorestore ./backup
```

### Atlas

Puedes hacer backup directamente desde el dashboard de MongoDB Atlas

## Monitoreo

### MongoDB Compass (GUI)

1. Descarga [MongoDB Compass](https://www.mongodb.com/products/tools/compass)
2. Conecta a `mongodb://localhost:27017`
3. Navega por tus colecciones

### Logs

```bash
# Ver logs en tiempo real
tail -f /usr/local/var/log/mongodb/mongo.log
```

## Limpiar Base de Datos

```bash
# Eliminar colección
db.bookings.deleteMany({})

# Eliminar toda la base de datos
db.dropDatabase()
```

## Variables de Entorno para Desarrollo

```env
# Desarrollo Local
MONGODB_URI=mongodb://localhost:27017/stivenads

# Desarrollo con Autenticación
MONGODB_URI=mongodb://admin:password@localhost:27017/stivenads

# Production (Atlas)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/stivenads
```
