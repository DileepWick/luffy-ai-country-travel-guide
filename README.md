[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/mNaxAqQD)

# 🌍 Country Info App

A modern React + TypeScript + Vite application that displays country data from the REST Countries API. It includes a responsive UI using HeroUI, unit/integration tests with Vitest, and linting via ESLint.

---

## 🔗 Hosted Link 
https://af-assignment-hosting-repo.vercel.app/
 

## 🚀 Features

- 🌐 Real-time data from [REST Countries API](https://restcountries.com)
- 🔍 Search by name and filter by region
- 📋 Detailed country info: flag, name, population, region, capital, languages
- 🧪 Unit & integration testing with **Vitest**
- 🧹 Code linting with **ESLint**
- ⚡ Fast development using **Vite**
- 💄 Clean UI with **HeroUI**

---

## 📦 Tech Stack

- **Frontend:** React (Vite) + TypeScript
- **Styling:** HeroUI + Tailwind CSS
- **Testing:** Vitest + Testing Library
- **Linting:** ESLint
- **API Source:** [REST Countries v3.1](https://restcountries.com)

---


# Install dependencies
npm install

# Start development server
npm run dev

# 📜 Scripts
npm run dev	        - Start local dev server with Vite
npm run build	    - Type-check and build for production
npm run preview	    - Preview production build locally
npm run lint	    - Run ESLint with auto-fix
npm run unit-test	- Run all unit tests
npm run intg-test	- Run integration test


# 🔌 API Endpoints Used

GET /all – Get all countries
GET /name/{name} – Search by country name
GET /region/{region} – Filter by region
GET /alpha/{code} – Get full details by country code

# 🧪 Running Tests
# Run all unit tests
npm run unit-test

# Run integration test
npm run intg-test
