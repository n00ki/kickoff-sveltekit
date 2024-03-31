// Env Variables
import { SENDGRID_API_KEY, EMAIL_SENDER } from '$env/static/private';

// Utils
import sendgrid from '@sendgrid/mail';
import { fail } from '@sveltejs/kit';
import { render } from 'svelty-email';

// Templates
import WelcomeTemplate from '$lib/utils/mail/templates/Welcome.svelte';
import ResetPasswordTemplate from '$lib/utils/mail/templates/ResetPassword.svelte';
import AccountInviteTemplate from '$lib/utils/mail/templates/AccountInvite.svelte';

export const sendEmail = async (to: string, subject: string, templateName: string, templateData?: any) => {
  if (to && subject && templateName) {
    sendgrid.setApiKey(SENDGRID_API_KEY);

    let html;

    switch (templateName) {
      case 'Welcome':
        html = render({
          template: WelcomeTemplate
        });
        break;
      case 'ResetPassword':
        html = render({
          template: ResetPasswordTemplate,
          props: {
            url: templateData?.url
          }
        });
        break;
      case 'AccountInvite':
        html = render({
          template: AccountInviteTemplate,
          props: {
            url: templateData?.url
          }
        });
        break;
      default:
        return fail(402);
    }

    const options = {
      from: EMAIL_SENDER,
      to,
      subject,
      html
    };

    await sendgrid.send(options);
    console.log('Email sent successfully');
  }
};
