# MAX

Веб-чат для отправки и получения текстовых сообщений в мессенджере MAX через [GREEN-API](https://green-api.com/max).

## Требования

- Node.js 20 или новее
- npm

## Запуск

Из корня репозитория:

```bash
cd max-green
npm install
npm run dev
```

После запуска откройте адрес, который Vite выведет в терминале. Обычно это [http://localhost:5173](http://localhost:5173).

На экране входа укажите данные инстанса GREEN-API: `apiUrl`, `idInstance` и `apiTokenInstance`. Поле «Пароль авторизации» заполняйте только если на аккаунте MAX включён облачный пароль.

## Сборка

```bash
npm run build
npm run preview
```

`build` проверяет типы и собирает статику в папку `dist`. `preview` поднимает локальный сервер с этой сборкой.
