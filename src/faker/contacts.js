import { faker } from '@faker-js/faker'
import bcrypt from 'bcrypt'
import config from '../config.js';
import prisma from '../prisma.js';

const generatePhoneNumber = () => {
    const startNum = ['6', '7', '8', '9']
    const generateRemaining = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('')
    return startNum[Math.floor(Math.random() * startNum.length)] + generateRemaining
}

const contactFake = () => {
    const rnd = Math.floor(Math.random() * 10)
    return {
        userId: 2,
        name: faker.person.fullName(),
        phoneNumber: generatePhoneNumber()
    }
}

const createContacts = async (data) => {
    await prisma.contact.createMany({
        data: data,
        skipDuplicates: true
    })
}

const createData = []
let x = 1;

while (x <= 10) {
    createData.push(contactFake())
    x++
}

console.debug(createData)
createContacts(createData)