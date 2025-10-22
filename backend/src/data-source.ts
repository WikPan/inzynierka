import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { User } from "./users/users.entity";
import { Offer } from "./offers/offer.entity";
import { OfferImage } from "./offers/offer-image.entity";
import { Review } from "./reviews/reviews.entity";
import { Message } from "./messages/messages.entity";

dotenv.config(); // <-- to dodaj

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "inzynierka",
  synchronize: false,
  logging: true,
  entities: [User, Offer, OfferImage, Review, Message],
  migrations: ["src/migrations/*.ts"],
});
