import "reflect-metadata";
import { AppDataSource } from "./data-source";

export async function runMigrationsIfNeeded() {
  try {
    await AppDataSource.initialize();

    const hasMigrations = await AppDataSource.showMigrations();
    if (hasMigrations) {
      console.log("Nowe migracje wykryte! Uruchamiam migracje...");
      await AppDataSource.runMigrations();
      console.log("Migracje zakończone!");
    } else {
      console.log("Brak nowych migracji. Kontynuuję start aplikacji...");
    }

    await AppDataSource.destroy();
  } catch (err) {
    console.error("Błąd przy sprawdzaniu migracji:", err);
    process.exit(1);
  }
}

// Jeśli chcesz uruchamiać ręcznie przez npm script
if (require.main === module) {
  runMigrationsIfNeeded();
}
