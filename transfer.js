// transfer.js
const { ethers } = require('ethers');
const readlineSync = require('readline-sync');

// Фиксированные значения
const rpcUrl = 'https://ethereum-sepolia-rpc.publicnode.com';

// Функция для отправки ETH
async function sendETH() {
    // Запрос приватного ключа у пользователя
    const privateKey = readlineSync.question('Введите приватный ключ отправителя: ');
    const senderWallet = new ethers.Wallet(privateKey);
    
    // Создание провайдера
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl); 
    const walletWithProvider = senderWallet.connect(provider);

    // Запрос адресов получателей у пользователя
    const recipientInput = readlineSync.question('Введите адреса получателей через запятую: ');
    const recipientAddresses = recipientInput.split(',').map(address => address.trim());

    // Получение баланса отправителя
    const balance = await provider.getBalance(walletWithProvider.address);
    console.log(`Баланс отправителя: ${ethers.utils.formatEther(balance)} ETH`);

    // Запрос способа отправки и суммы
    console.log('Выберите способ отправки:');
    console.log('1) Отправить пропорционально балансу');
    console.log('2) Отправить рандомно');
    
    const optionInput = readlineSync.question('Введите 1 или 2: ');
    
    let option;
    if (optionInput === '1') {
        option = 0; // Пропорционально балансу
    } else if (optionInput === '2') {
        option = 1; // Рандомно
    } else {
        console.log('Неверный ввод. Выбор отменен.');
        return;
    }

    if (option === 0) { // Пропорционально балансу
        const totalRecipients = recipientAddresses.length;
        const gasEstimate = ethers.utils.parseEther("0.01"); // Оценка газа (можно изменить по необходимости)
        const totalAmountToSend = balance.sub(gasEstimate);

        const amountToSend = totalAmountToSend.div(totalRecipients);
        console.log(`Каждому получателю будет отправлено: ${ethers.utils.formatEther(amountToSend)} ETH`);
        
        // Отправка ETH каждому получателю
        for (const recipient of recipientAddresses) {
            try {
                const tx = await walletWithProvider.sendTransaction({
                    to: recipient,
                    value: amountToSend,
                });
                console.log(`Транзакция отправлена: ${tx.hash}`);
                await tx.wait(); // Ожидание подтверждения транзакции
                console.log(`Транзакция подтверждена для ${recipient}`);
            } catch (error) {
                console.error(`Ошибка при отправке на ${recipient}:`, error);
                return; // Прекращаем выполнение скрипта при ошибке
            }
        }
        
    } else if (option === 1) { // Рандомно
        const minAmount = readlineSync.questionFloat('Введите минимальную сумму для отправки (в ETH): ');
        const maxAmount = readlineSync.questionFloat('Введите максимальную сумму для отправки (в ETH): ');

        // Проверка на корректность ввода
        if (minAmount >= maxAmount) {
            console.log("Минимальная сумма должна быть меньше максимальной.");
            return;
        }

        // Отправка ETH каждому получателю с уникальной случайной суммой
        for (const recipient of recipientAddresses) {
            // Генерация случайной суммы для каждого получателя
            const randomValue = Math.random() * (maxAmount - minAmount) + minAmount;
            const amountToSend = ethers.utils.parseEther(randomValue.toFixed(18)); // Преобразуем в wei

            console.log(`Случайно выбрана сумма для отправки на ${recipient}: ${ethers.utils.formatEther(amountToSend)} ETH`);

            // Проверка, чтобы сумма не превышала баланс
            if (amountToSend.gt(balance)) {
                console.log("Недостаточно средств на счете для выполнения этой транзакции.");
                return;
            }

            try {
                const tx = await walletWithProvider.sendTransaction({
                    to: recipient,
                    value: amountToSend,
                });
                console.log(`Транзакция отправлена: ${tx.hash}`);
                await tx.wait(); // Ожидание подтверждения транзакции
                console.log(`Транзакция подтверждена для ${recipient}`);
            } catch (error) {
                console.error(`Ошибка при отправке на ${recipient}:`, error);
                return; // Прекращаем выполнение скрипта при ошибке
            }
        }
    }
}

// Запуск функции отправки ETH с повторной попыткой
async function main() {
    while (true) {
        await sendETH();
        const retry = readlineSync.keyInYNStrict("Хотите попробовать снова? (Y/N): ");
        if (!retry) break; // Выход из цикла, если пользователь не хочет повторять
    }
}

main().catch(console.error);