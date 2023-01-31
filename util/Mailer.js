import dotenv from "dotenv";
dotenv.config();
import MailService from "@sendgrid/mail";

const LISTENER_ENV = process.env.LISTENER_ENV;

MailService.setApiKey(process.env.SENDGRID_KEY);

const RECIPIENTS = [
    "fiaz.sami@gmail.com",
    "delaney@dgens.io",
    "berlinkoma@gmail.com",
    "omakasea@protonmail.com",
];

class Mailer {
    static async sendEmail(subject, text) {
        const msg = {
            to: RECIPIENTS,
            from: "backend@omakasea.com",
            subject: `[${LISTENER_ENV}] ${subject}`,
            text,
        };

        try {
            const response = await MailService.send(msg);
            console.log(response[0].statusCode);
            console.log(response[0].headers);
        } catch (error) {
            console.error(error);
        }
    }
}

export default Mailer;
