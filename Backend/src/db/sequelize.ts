import { Sequelize } from "sequelize-typescript";
import config from 'config'
import DevTeam from "../models/DevTeam";
import Meeting from "../models/Meeting";

const sequelize = new Sequelize({
    dialect: 'mysql',
    models: [DevTeam, Meeting],
    logging: console.log,
    // Treat datetimes as wall-clock, with no timezone shifting:
    // - timezone '+00:00' so DATETIMEs are written/read with their literal digits
    // - dateStrings so reads come back as plain strings (e.g. "2026-05-04 10:00:00")
    //   instead of JS Date objects that would be re-interpreted per timezone
    timezone: '+00:00',
    dialectOptions: {
        dateStrings: true
    },
    ...config.get('db')
})

console.log(`connected to database on `, config.get('db'))

export default sequelize
