
import { Injectable, RequestTimeoutException } from "@nestjs/common"
import { user } from '../users/user.entity';
import { MailerService } from "@nestjs-modules/mailer";


@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
  ) {}

  private async send(
    user: user,
    template: string,
    subject: string,
    url?: string,
  ) {
    console.log('helow from send ')
    try{
    const firstName = user.userName.split(' ')[0];
    console.log(firstName)
    await this.mailerService.sendMail({
      to: user.email,
      from:`suportTeam@mail.com`,
      subject,
      template:template,
      context: {
        subject,
        firstname: firstName,
        url,
      },
    });} catch(err) {
      console.log(err)
      throw new RequestTimeoutException('there is a problem happen when sending email to you');
    }
  }

  public async sendWelcome(user: user, url?: string) {
    await this.send(
      user,
      'welcome',
      'WELCOME TO OUR FAMILY !!',
      url,
    );
  }

  public async sendResetPassword(user: user, resetUrl: string) {
    await this.send(
      user,
      'resetPass',
      'Your password reset token is valid for 10 min',
      resetUrl,
    );
  }
  public async sendValidationEmail(user:user, validationTokenUrl:string){
    console.log('helow from send validate')
    await this.send(
        user,
        'validation',
        ' EMAIL VALIDATION ',
        validationTokenUrl,
    )
  }
}