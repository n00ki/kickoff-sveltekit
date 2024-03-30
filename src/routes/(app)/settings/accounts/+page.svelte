<script lang="ts">
  // Env Variables
  import { PUBLIC_AWS_S3_BUCKET_URL } from '$env/static/public';

  // Utils
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { createAccountSchema } from '$lib/validations/account';
  import * as flashModule from 'sveltekit-flash-message/client';

  // Components
  import * as Form from '$components/ui/form';
  import { Input } from '$components/ui/input';
  import { Badge } from '$components/ui/badge';
  import * as Avatar from '$lib/components/ui/avatar';
  import { Separator } from '$components/ui/separator';

  // Icons
  import Reload from 'svelte-radix/Reload.svelte';

  export let data;

  const form = superForm(data.form, {
    validators: zodClient(createAccountSchema),
    invalidateAll: 'force',
    multipleSubmits: 'prevent',
    syncFlashMessage: false,
    flashMessage: {
      module: flashModule
    }
  });

  const { form: formData, delayed, enhance } = form;
</script>

{#if data.userAccounts}
  <div class="grid gap-2">
    {#each data.userAccounts as userAccount}
      <a href="/settings/accounts/{userAccount.account.publicId}">
        <div class="rounded-xl border-2 border-primary p-4 shadow-sm">
          <div class="flex items-center justify-between">
            <h1 class="text-xl font-semibold">{userAccount.account.name}</h1>
            <Badge variant="outline">{userAccount.account.type}</Badge>
          </div>
          <div class="flex gap-2 py-4">
            {#each userAccount.account.members as member}
              <Avatar.Root class="z-50 ring-2 ring-border">
                {#if member.user.avatar}
                  <Avatar.Image
                    src={`${PUBLIC_AWS_S3_BUCKET_URL}/avatars/${member.user.avatar}`}
                    alt={member.user.email}
                  />
                {/if}
                <Avatar.Fallback class="uppercase">{member.user.email?.charAt(0)}</Avatar.Fallback>
              </Avatar.Root>
            {/each}
          </div>
        </div>
      </a>
    {/each}
  </div>
{/if}

<Separator class="my-4" />

<h2 class="text-lg font-semibold">Create a New Account</h2>
<form id="create-account-form" method="POST" action="?/createAccount" class="py-4" use:enhance>
  <Form.Field {form} name="userId">
    <Form.Control let:attrs>
      <Form.Label hidden>User ID</Form.Label>
      <Input type="hidden" value={data.user?.id ?? ''} {...attrs} />
    </Form.Control>
  </Form.Field>
  <Form.Field {form} name="name" let:constraints>
    <Form.Control let:attrs>
      <Form.Label hidden>Name</Form.Label>
      <Input type="text" placeholder="Account Name" bind:value={$formData.name} {...attrs} {...constraints} />
      <Form.FieldErrors />
    </Form.Control>
  </Form.Field>

  <Form.Button type="submit" disabled={$delayed} class="my-2 w-full">
    {#if $delayed}
      <Reload class="mr-2 h-4 w-4 animate-spin" />
    {/if}
    Create
  </Form.Button>
</form>
