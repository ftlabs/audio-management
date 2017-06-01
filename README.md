# FT Labs Audio Management Service
A place for FT staff to manage the availability of FT audio content.

![audio-dash](https://cloud.githubusercontent.com/assets/913687/24905804/23c2786a-1ead-11e7-8434-897ff30fb1f2.png)

The audio management dashboard lists all of the audio files of FT content available for consumption by our apps and services.

From here, each item can be listened to, disabled, deleted, and re-enabled if previously deleted.

## Building

1. First, clone this repo.
2. `cd` into the cloned repo.
3. Run `npm i`
4. The project will now be built

## Running

1. Having followed the building steps, run `npm run start`
2. Providing all requisite env vars have been correctly configured, the dashboard should not be accessible on [localhost:3000](http://localhost:3000)

### Deleting an articles audio files

An item can be deleted by clicking the bin on its row in the table. A confirm dialog will appear to make sure you really mean to do this. 

If you decide you really want to delete the audio assets for an FT article, all existing audio files and metadata will be deleted immediately. 

An entry for the article will still persist in the DynamoDB audio metadata table with a `uuid` and an `enabled` property. This is so any files that have been deleted after having been disabled will still be disabled if they are reabsorbed.

The delete action will trigger a purge of the audio availability service's cache, so that all FT services that were using the asset will immediately become aware of the change.

![delete-item](https://cloud.githubusercontent.com/assets/913687/24906039/1d5fa6d6-1eae-11e7-97cb-5a234330c785.png)

### Disabling audio for an article

The availability of an articles audio content can also be toggled with the enabled/disabled checkbox.

Checking/unchecking a box will trigger a purge of the audio availability service's cache, so that all FT services that were using the asset will immediately become aware of the change.

### Viewing rogue articles

It is possible for an article to have been tagged by the `audio-articles` topic, but that we have never received, or do not currently have audio information for that article. In a production environment (an environment where the environment variable `NODE_ENV` is set to `production`), a banner will appear above the table to alert the user that the audio for this article has 'gone rogue'. 

To view these rogue articles on a development environment, add the query parameter `?showrogues=true` to the end of the URL for the dashboard, and they will appear.

## Environment Variables

**DEBUG**
- A string to filter logging. `*` will output all logs.

**AWS_ACCESS_KEY_ID**
- An AWS access key tied to an account with S3/DynamoDB read/write permissions.

**AWS_SECRET_ACCESS_KEY**
- The secret key for the access key.

**AWS_AUDIO_BUCKET**
- The name of the S3 bucket where audio for FT content is stored.

**AWS_REGION**
- The AWS region code for your AWS resources.

**AWS_AUDIO_METADATA_TABLE**
- The name of the DynamoDB table where any metadata associated with audio files is stored.

**DELIVERED_MEDIA_FORMAT**
- The expected media format of audio files.

**FT_AVAILABILITY_SERVICE_URL**
- The URL for the [audio-available](https://audio-available.ft.com) service.

**FT_AVAILABILITY_SERVICE_CACHE_PURGE_KEY**
The key to trigger a cache purge on at the `/purge` endpoint of the availability service when a new item has been absorbed.

**CAPI_ENDPOINT**
- The URL for the FT CAPI service. Used to determine whether or not an article has been tagged as an 'audio-article' and thus available on FT.com

**CAPI_KEY**
- The key for the CAPI service.