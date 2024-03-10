import { faker } from '@faker-js/faker'
import bcrypt from 'bcrypt'
import config from '../config.js';
import prisma from '../prisma.js';

const generatePhoneNumber = () => {
    const startNum = ['6', '7', '8', '9']
    const generateRemaining = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('')
    return startNum[Math.floor(Math.random() * startNum.length)] + generateRemaining
}

const userFake = () => {
    const putEmail = Math.floor(Math.random() * 10)
    return {
        name: faker.person.fullName(),
        email: (putEmail > 5) ? faker.internet.email() : null,
        phoneNumber: generatePhoneNumber(),
        password: bcrypt.hashSync(config.fakeDataPassword, config.jwt_salt)
    }
}

const createUsers = async (data) => {
    await prisma.user.createMany({
        data: data,
        skipDuplicates: true
    })
}

const createData = []
let x = 1;

while (x <= 10) {
    createData.push(userFake())
    x++
}

console.debug(createData)
createUsers(createData)