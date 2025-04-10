import { PrismaClient } from "@prisma/client";
import * as fs from 'fs';

async function seed() {
  const prisma = new PrismaClient();
try {
    await prisma.$connect();
    // Utilise join pour construire le chemin correct vers le fichier
    console.log(__dirname); 
    const filePath = __dirname + '/daily-tips.json'
    const rawData = fs.readFileSync(filePath, "utf-8");
    console.log(rawData)
    const tips = JSON.parse(rawData);
    for (const tip of tips) {
      await prisma.dailyTip.create({
        data:tip,
      });
      console.log("Inserted tip:", tip);
    }
      console.log("Données insérées avec succès !");
 
}catch (error) {
    console.error("Erreur pendant le seed :", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();