# FT Labs Audio Management Service
A place for FT staff to manage the availability of FT audio content.

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