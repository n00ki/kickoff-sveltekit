<script lang="ts">
  // Env Variables
  import { PUBLIC_AWS_S3_BUCKET_URL } from '$env/static/public';

  // Utils
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { editUserSchema } from '$lib/validations/auth';
  import * as flashModule from 'sveltekit-flash-message/client';
  import { error } from '@sveltejs/kit';
  import { validateAvatarFile } from '$lib/validations/files';
  import { toast } from 'svelte-sonner';
  import * as m from '$lib/utils/messages';

  // Components
  import * as Form from '$components/ui/form';
  import { Input } from '$components/ui/input';
  import { Button } from '$components/ui/button';
  import * as AlertDialog from '$components/ui/alert-dialog';
  import * as Alert from '$components/ui/alert';
  import { Separator } from '$components/ui/separator';

  // Assets
  import avatarPlaceholder from '$lib/assets/avatar.png';

  // Icons
  import { Reload, CrossCircled } from 'svelte-radix';

  export let data;

  const userAvatar = data.user?.avatar ? `${PUBLIC_AWS_S3_BUCKET_URL}/avatars/${data.user.avatar}` : avatarPlaceholder;

  let fileUploadStatus: 'ready' | 'uploading' | 'uploaded' | 'failed' = 'ready';
  let fileUploadProgress: number = 0;
  let fileUploadErrors: string[] = [];
  let avatarFileId: string | null = null;
  let avatarPreviewUrl: string | null = null;

  const form = superForm(data.form, {
    validators: zodClient(editUserSchema),
    invalidateAll: true,
    delayMs: 500,
    multipleSubmits: 'prevent',
    syncFlashMessage: false,
    flashMessage: {
      module: flashModule
    },
    onSubmit: async ({ formData, cancel }) => {
      if (avatarFileId) {
        formData.set('avatar', avatarFileId as string);
      } else {
        formData.delete('avatar');
      }

      // prevent a request if the form is empty
      if (!avatarFileId) {
        cancel();
        toast.error('No changes were made');
      }
    }
  });

  const { enhance, delayed } = form;

  const uploadAvatar = async (event: Event) => {
    fileUploadStatus = 'ready';

    try {
      const avatarInputField: HTMLInputElement = event.target as HTMLInputElement;
      if (!avatarInputField.files) return;
      const avatarFile = avatarInputField.files[0];

      const { valid, errors } = validateAvatarFile(avatarFile);
      if (!valid) {
        fileUploadStatus = 'failed';
        fileUploadErrors = errors;
        toast.error(fileUploadErrors[0]);
        return;
      }

      const getPresignedUrl = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          fileType: avatarFile.type,
          destinationDirectory: 'avatars'
        })
      });

      const { fileName, presignedUrl } = await getPresignedUrl.json();

      const xhr = new XMLHttpRequest();

      xhr.upload.onloadstart = () => {
        fileUploadStatus = 'uploading';
      };

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          fileUploadProgress = Math.round((e.loaded / e.total) * 100);
        }
      };

      xhr.open('PUT', presignedUrl, true);
      xhr.setRequestHeader('Content-Type', avatarFile.type);
      xhr.send(avatarFile);

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            console.log('success');
            avatarPreviewUrl = `${PUBLIC_AWS_S3_BUCKET_URL}/avatars/${fileName}`;
            fileUploadStatus = 'uploaded';
            fileUploadProgress = 0;

            document.getElementById('edit-user-form')?.dispatchEvent(new Event('submit'));
          } else {
            console.log('failure');
            fileUploadStatus = 'failed';
            fileUploadErrors = ['Error uploading avatar'];
            fileUploadProgress = 0;
            toast.error('Error uploading avatar');
            error(500, 'Error uploading avatar');
          }
        }
      };

      avatarFileId = fileName ?? '';
    } catch (err) {
      fileUploadStatus = 'failed';
      fileUploadErrors = ['Error uploading avatar'];
      fileUploadProgress = 0;
      toast.error('Error uploading avatar');
      error(500, 'Error uploading avatar');
    }
  };
</script>

<div class="flex w-full flex-1 flex-col justify-center">
  <div
    class="conic-gradient mx-auto my-2 flex h-32 w-32 rounded-full p-1 ring-4 ring-accent drop-shadow-sm"
    style="--progress: {fileUploadProgress};"
  >
    <div class="m-auto flex h-full w-full items-center justify-center overflow-hidden rounded-full">
      <img
        src={avatarPreviewUrl ?? userAvatar}
        alt="avatar preview"
        class="min-h-full min-w-full shrink-0 object-cover"
      />
    </div>
  </div>

  <form id="edit-user-form" method="POST" action="?/editUser" enctype="multipart/form-data" use:enhance>
    <Form.Field name="avatar" {form} let:constraints>
      <Form.Control let:attrs>
        <Form.Label>Avatar</Form.Label>
        <Input
          type="file"
          on:change={uploadAvatar}
          disabled={fileUploadStatus === 'uploading'}
          class="p-1.5 file:text-secondary-foreground"
          {...attrs}
          {...constraints}
        />
        <Form.FieldErrors />
      </Form.Control>
    </Form.Field>

    <Form.Button disabled={$delayed} variant="secondary" class="my-2 hidden w-full">
      {#if $delayed}
        <Reload class="mr-2 h-4 w-4 animate-spin" />
      {/if}
      Update
    </Form.Button>
  </form>

  {#if fileUploadStatus === 'failed'}
    {#each fileUploadErrors as error}
      <Alert.Root variant="destructive" class="inline-flex items-center gap-2 py-2">
        <div>
          <CrossCircled class="h-6 w-6" />
        </div>
        <Alert.Description>{error}</Alert.Description>
      </Alert.Root>
    {/each}
  {/if}

  <Separator class="my-4" />

  <h2 class="text-lg font-semibold">Danger Zone</h2>
  <AlertDialog.Root>
    <AlertDialog.Trigger class="w-full">
      <Button variant="destructive" class="my-2 w-full">Delete Account</Button>
    </AlertDialog.Trigger>
    <AlertDialog.Content>
      <AlertDialog.Header>
        <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
        <AlertDialog.Description>
          {m.userProfile.delete.destructiveOperation}
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer>
        <AlertDialog.Cancel>Back to safety</AlertDialog.Cancel>
        <AlertDialog.Action
          type="submit"
          form="delete-user-form"
          class="bg-destructive/90 text-destructive-foreground hover:bg-destructive"
        >
          Continue
          <form
            id="delete-user-form"
            action="?/deleteUser"
            method="POST"
            class="mx-auto flex w-full flex-col items-center justify-center"
          ></form>
        </AlertDialog.Action>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>
</div>

<style>
  .conic-gradient {
    background: conic-gradient(
      var(--outline, rgb(16, 185, 129)) calc(var(--progress, 0) * 1%),
      transparent calc(var(--progress, 0) * 1%)
    );
  }
</style>
