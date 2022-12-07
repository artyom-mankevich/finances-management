Перейти в директорию мобильного приложения

#### `cd mobile/`

Установить зависимости из package.json

#### `npm install`

Запустить приложение 

#### `npm start`
#### или
#### `npm start -- --reset-cache`

Для запуска приложения на Android, установить [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent&hl=ru&gl=US) и отсканировать QR-код либо ввести [URL](exp://192.168.100.5:19000) вручную.

```
exp://192.168.0.1:19000
```

## Http tunnel

Для соединения с api скачать и установить [ngrok](https://dashboard.ngrok.com/get-started/setup), далее

#### `ngrok http 8087`

Новый URL нужно вставить в [ngrok.config.js](https://github.com/artyom-mankevich/trpo/blob/feat/wallet-page/mobile/components/ngrok.config.js)
