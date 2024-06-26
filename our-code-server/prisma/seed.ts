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
      email: 'demouser@example.com', // Replace with your desired email
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

  const demoWorkspaceId = demoUser.ownedWorkspaces[0].id;

  const folder = await prisma.folder.create({
    data: {
      name: 'My Folder',
      workspace: {
        connect: {
          id: demoWorkspaceId,
        }
      },
    }
  });

  const folder2 = await prisma.folder.create({
    data: {
      name: 'My second folder',
      workspace: {
        connect: {
          id: demoWorkspaceId,
        }
      },
      folders: {
        create: {
          name: 'My subfolder',
          workspace: {
            connect: {
              id: demoWorkspaceId,
            }
          }
        }
      }
    }
  });

  const file1 = await prisma.file.create({
	data: {
	  name: 'My File',
	  content: "",
	  workspace: {
		connect: {
		  id: demoWorkspaceId,
		}
	  }
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
