#!/usr/bin/env node

import { spawn } from 'child_process';
import express from "express";
import path from "path";
import fs from 'fs';

function server() {
	new Promise((resolve, reject) => {
		const app = express();
		const PORT = 3000;
		const target = process.argv[2]

		app.get("/", (request, response) => {
			fs.stat(target, (err, stats) => {
			    if (err) {
			        console.error('Error:', err);
			        return;
			    }

			    if (stats.isFile()) {
				    response.download(path.join(process.cwd(), target), target.replace(/^\.?[\/\\]/, ''), (err) => {
				        if (err) {
				            console.error("Problem on download firmware: ", err);
				        }
				    });
			    } else if (stats.isDirectory()) {
			        fs.readdir(path.join(process.cwd(), target), (err, files) => {
				        if (err) {
				            return response.status(500).json({ error: 'Internal Server Error' });
				        }
				        response.json({ directories: files });
				    });
			    } else {
			        console.log(`${target} tidak dikenali sebagai file atau direktori.`);
			    }
			});
		});

		app.listen(PORT, () => {
		    console.log(`Server download bin menyala pada http://localhost:${PORT}`);
		    resolve()
		});
	})
}

function cloudflare() {
	const tunnel = spawn('cloudflared', ['tunnel', '--url', 'http://localhost:3000'], {
		stdio: 'inherit',
		cwd: 'C:\\Program Files (x86)\\cloudflared'
	});

	tunnel.on('close', (code) => {
		console.log(`Proses anak keluar dengan kode ${code}`);
	});

}

async function main() {
	if (process.argv.length > 2) {
		await server()
		if (process.argv[3] == '--cloudflared') {
			await cloudflare()
		}
	}
}

main()