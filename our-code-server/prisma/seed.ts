import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
	// clear the database
	const tableNames = [
		"User",
    "Workspace",
    "Folder",
    "File",
	];

	// make sure to keep this in sync with the schema
	for (const tableName of tableNames) {
		await prisma.$executeRawUnsafe(
			`Truncate "${tableName}" restart identity cascade;`
		);
	}

  const demoUser = await prisma.user.create({
    data: {
      email: 'example@example.com', // Replace with your desired email
      ownedWorkspaces: {
        create: {
          name: 'My Workspace',
        }
      }
    },
    include: {
      ownedWorkspaces: true // To include the created workspace in the response
    }
  });

  console.log(`Created user with id: ${demoUser.id} and workspace with id: ${demoUser.ownedWorkspaces[0].id}`);
	console.log("All Done...");
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async e => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
