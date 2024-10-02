Утсановка mkdir eth-transfer && cd eth-transfer && npm init -y && echo '{"name":"eth-transfer","version":"1.0.0","main":"index.js","scripts":{"start":"node transfer.js"},"dependencies":{"ethers":"5.7.0","readline-sync":"^1.4.10"},"license":"ISC"}' > package.json && curl -O https://raw.githubusercontent.com/Triplooker/Combine_sender/refs/heads/main/transfer.js && npm install





npm start
