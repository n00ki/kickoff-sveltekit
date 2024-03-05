// Types
import { type Action, type Actions } from '@sveltejs/kit';

// Utils
import { redirect } from 'sveltekit-flash-message/server';
import { zod } from 'sveltekit-superforms/adapters';
import { superValidate } from 'sveltekit-superforms/server';
import { setFormFail } from '$lib/utils/helpers/forms';
import { eq } from 'drizzle-orm';
import * as m from '$lib/utils/messages';

// Schemas
import { createAccountSchema } from '$lib/validations/account';

// Database
import db from '$lib/server/database';
import { Users } from '$models/user';
import { Accounts, UsersAccounts } from '$models/account';

export const load = async (event) => {
  if (!event.locals.user) {
    redirect('/login', { type: 'error', message: m.general.unauthorized }, event);
  }

  const getUserAccounts = await db.query.Users.findFirst({
    where: eq(Users.id, event.locals.user.id),
    columns: {},
    with: {
      userAccounts: {
        with: {
          account: {
            with: {
              members: {
                with: {
                  user: true
                }
              }
            }
          }
        }
      }
    }
  });

  const form = await superValidate(zod(createAccountSchema));

  return {
    userAccounts: getUserAccounts?.userAccounts,
    form
  };
};

const createAccount: Action = async (event) => {
  const createAccountForm = await superValidate(event.request, zod(createAccountSchema));

  if (!createAccountForm.valid) {
    return setFormFail(createAccountForm);
  }

  const { userId, name } = createAccountForm.data;

  try {
    const createAccount = await db
      .insert(Accounts)
      .values({
        name
      })
      .returning();

    const account = createAccount[0];

    if (account) {
      await db.insert(UsersAccounts).values({
        accountId: account.id,
        userId: userId,
        role: 'admin'
      });
    }
  } catch (error) {
    console.log(error);
    redirect(
      {
        status: 500,
        type: 'error',
        message: m.general.error
      },
      event
    );
  }

  redirect(
    event.url.pathname,
    {
      type: 'success',
      message: m.accounts.create.success
    },
    event
  );
};

export const actions: Actions = { createAccount };
