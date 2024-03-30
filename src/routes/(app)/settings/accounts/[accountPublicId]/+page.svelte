<script lang="ts">
  // Env Variables
  import { PUBLIC_AWS_S3_BUCKET_URL } from '$env/static/public';

  // Utils
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { createAccountInviteSchema, deleteAccountSchema, editAccountSchema } from '$lib/validations/account';
  import * as flashModule from 'sveltekit-flash-message/client';
  import { toast } from 'svelte-sonner';
  import * as m from '$lib/utils/messages';

  // Components
  import * as Form from '$components/ui/form';
  import { Input } from '$components/ui/input';
  import * as Avatar from '$lib/components/ui/avatar';
  import { Button } from '$components/ui/button';
  import * as AlertDialog from '$components/ui/alert-dialog';
  import { Separator } from '$components/ui/separator';

  // Icons
  import { Reload, Pencil2 } from 'svelte-radix';

  export let data;
  let isEditMode = false;

  const createAccountInviteForm = superForm(data.createAccountInviteForm, {
    validators: zodClient(createAccountInviteSchema),
    invalidateAll: 'force',
    delayMs: 500,
    multipleSubmits: 'prevent',
    syncFlashMessage: false,
    flashMessage: {
      module: flashModule
    }
  });

  const {
    form: createAccountInviteFormData,
    enhance: createAccountInviteFormEnhance,
    delayed: createAccountInviteFormDelayed
  } = createAccountInviteForm;

  const editAccountForm = superForm(data.editAccountForm, {
    validators: zodClient(editAccountSchema),
    invalidateAll: 'force',
    multipleSubmits: 'prevent',
    syncFlashMessage: false,
    flashMessage: {
      module: flashModule
    },
    onSubmit: async ({ formData, cancel }) => {
      if (formData.get('name') === data.account.name) {
        cancel();
        isEditMode = false;
        toast.error('No changes were made');
      }
    },
    onResult({ result }) {
      console.log(result);
      if (result.type === 'redirect' && result.status !== 500) {
        isEditMode = false;
      }
    }
  });

  const { form: editAccountFormData, enhance: editAccountFormEnhance } = editAccountForm;

  const leaveAccountForm = superForm(data.leaveAccountForm, {
    invalidateAll: true,
    multipleSubmits: 'prevent',
    syncFlashMessage: false,
    flashMessage: {
      module: flashModule
    }
  });

  const { delayed: leaveAccountFormDelayed, enhance: leaveAccountFormEnhance } = leaveAccountForm;

  const deleteAccountForm = superForm(data.deleteAccountForm, {
    validators: zodClient(deleteAccountSchema),
    invalidateAll: 'force',
    delayMs: 500,
    multipleSubmits: 'prevent',
    syncFlashMessage: false,
    flashMessage: {
      module: flashModule
    }
  });

  const { form: deleteAccountFormData, enhance: deleteAccountFormEnhance } = deleteAccountForm;
</script>

<div>
  {#if isEditMode}
    <form id="edit-account-form" method="POST" action="?/editAccount" use:editAccountFormEnhance>
      <Input type="hidden" name="accountId" value={$editAccountFormData.accountId} />
      <Form.Field form={editAccountForm} name="name" let:constraints>
        <Form.Control let:attrs>
          <Form.Label hidden>Name</Form.Label>
          <Input
            type="text"
            placeholder="Account Name"
            bind:value={$editAccountFormData.name}
            {...attrs}
            {...constraints}
          />
          <Form.FieldErrors />
        </Form.Control>
      </Form.Field>

      <Form.Button type="submit" class="my-2 w-full">Update</Form.Button>
    </form>
  {:else}
    <div class="flex w-full items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold">{data.account.name}</h1>
        <p class="text-secondary-foreground">{data.account.type} account</p>
      </div>

      {#if data.account.type !== 'personal'}
        <Button
          variant="secondary"
          on:click={() => {
            isEditMode = true;
          }}
        >
          <Pencil2 class="size-5" />
        </Button>
      {/if}
    </div>
  {/if}
</div>

<div class="py-4">
  <h2 class="text-lg font-semibold">Members</h2>
  <ul class="flex w-full flex-wrap gap-4 pt-2">
    {#each data.account.members as member}
      <li class="flex flex-col items-center justify-center">
        <Avatar.Root class="ring-2 ring-border">
          {#if member.user.avatar}
            <Avatar.Image src={`${PUBLIC_AWS_S3_BUCKET_URL}/avatars/${member.user.avatar}`} alt={member.user.email} />
          {/if}
          <Avatar.Fallback class="uppercase">{member.user.email?.charAt(0)}</Avatar.Fallback>
        </Avatar.Root>
        <p class="mt-1 text-sm font-light">{member.role}</p>
      </li>
    {/each}
  </ul>
</div>

{#if data.account.type !== 'personal'}
  <Separator class="my-4" />
  <h2 class="text-lg font-semibold">Invite a new member</h2>
  <form
    id="invite-form-{data.account.id}"
    method="POST"
    action="?/createAccountInvite"
    use:createAccountInviteFormEnhance
  >
    <Input type="hidden" name="accountId" value={$createAccountInviteFormData.accountId} />
    <Form.Field form={createAccountInviteForm} name="email" let:constraints>
      <Form.Control let:attrs>
        <Form.Label hidden>Email</Form.Label>
        <Input
          type="email"
          autocapitalize="none"
          autocorrect="off"
          autocomplete="username"
          bind:value={$createAccountInviteFormData.email}
          {...attrs}
          {...constraints}
        />
        <Form.FieldErrors />
      </Form.Control>
    </Form.Field>

    <Form.Button type="submit" disabled={$createAccountInviteFormDelayed} class="my-2 w-full">
      {#if $createAccountInviteFormDelayed}
        <Reload class="mr-2 h-4 w-4 animate-spin" />
      {/if}
      Invite
    </Form.Button>
  </form>

  <Separator class="my-4" />

  <h2 class="text-lg font-semibold">Danger Zone</h2>
  {#if data.account.members.find((m) => m.userId === data.user?.id && m.role === 'admin')}
    <AlertDialog.Root>
      <AlertDialog.Trigger class="w-full">
        <Button variant="destructive" class="my-2 w-full">Delete Team Account</Button>
      </AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
          <AlertDialog.Description>
            {m.accounts.delete.destructiveOperation}
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel>Back to safety</AlertDialog.Cancel>
          <AlertDialog.Action
            type="submit"
            form="delete-account-form"
            class="bg-destructive/90 text-destructive-foreground hover:bg-destructive"
          >
            Continue
            <form id="delete-account-form" method="POST" action="?/deleteAccount" use:deleteAccountFormEnhance>
              <Form.Field form={deleteAccountForm} name="accountId" class="space-y-0">
                <Form.Control let:attrs>
                  <Form.Label hidden>Account ID</Form.Label>
                  <Input type="hidden" bind:value={$deleteAccountFormData.accountId} {...attrs} />
                  <Form.FieldErrors />
                </Form.Control>
              </Form.Field>
            </form>
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Root>
  {:else}
    <form id="leave-account-form" method="POST" action="?/leaveAccount" use:leaveAccountFormEnhance>
      <Form.Field form={leaveAccountForm} name="accountId">
        <Form.Control let:attrs>
          <Form.Label hidden>Account ID</Form.Label>
          <Input type="hidden" bind:value={data.account.id} {...attrs} />
        </Form.Control>
      </Form.Field>

      <Form.Field form={leaveAccountForm} name="userId">
        <Form.Control let:attrs>
          <Form.Label hidden>User ID</Form.Label>
          <Input type="hidden" value={data.user?.id} {...attrs} />
        </Form.Control>
      </Form.Field>

      <Form.Button type="submit" variant="destructive" disabled={$leaveAccountFormDelayed} class="my-2 w-full">
        {#if $leaveAccountFormDelayed}
          <Reload class="mr-2 h-4 w-4 animate-spin" />
        {/if}
        Leave Account
      </Form.Button>
    </form>
  {/if}
{/if}
