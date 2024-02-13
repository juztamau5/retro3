# Retro3 Embed API

retro3 lets you embed videos and programmatically control their playback. This documentation covers how to interact with the Retro3 Embed API.

## Playground

Any retro3 embed URL (ie `https://my-instance.example.com/videos/embed/52a10666-3a18-4e73-93da-e8d3c12c305a`) can be viewed as an embedding playground which
allows you to test various aspects of retro3 embeds. Simply replace `/embed` with `/test-embed` and visit the URL in a browser.
For instance, the playground URL for the above embed URL is `https://my-instance.example.com/videos/test-embed/52a10666-3a18-4e73-93da-e8d3c12c305a`.

## Quick Start

Given an existing retro3 embed `<iframe>` **with API enabled** (`https://my-instance.example.com/videos/embed/52a10666-3a18-4e73-93da-e8d3c12c305a?api=1`),
one can use the Retro3 Embed API to control it by first including the library. You can include it via Yarn with:

```
yarn add @retroai/embed-api
```

Now just use the `Retro3Player` class exported by the module:

```typescript
import { Retro3Player } from '@retroai/embed-api.js'

...
```

Or use the minified build from NPM CDN in your HTML file:

```
<script src="https://unpkg.com/@retroai/embed-api/build/player.min.js"></script>

<script>
  const Retro3Player = window['Retro3Player']

  ...
</script>
```

Then you can instantiate the player:

```typescript
let player = new Retro3Player(document.querySelector('iframe'))
await player.ready // wait for the player to be ready

// now you can use it!
player.play()
player.seek(32)
player.pause()
```

## Embed URL parameters

You can customize retro3 player by specifying URL query parameters.
For example `https://my-instance.example.com/videos/embed/52a10666-3a18-4e73-93da-e8d3c12c305a?start=1s&stop=18s&loop=1&autoplay=1&muted=1&warningTitle=0&controlBar=0&retro3Link=0&p2p=0`

### start

Start the video at a specific time.
Value must be raw seconds or a duration (`3m4s`)

### stop

Stop the video at a specific time.
Value must be raw seconds or a duration (`54s`)

### controls

Mimics video HTML element `controls` attribute, meaning that all controls (including big play button, control bar, etc.) will be removed.
It can be useful if you want to have a full control of the retro3 player.

Value must be `0` or `1`.

### controlBar

Hide control bar when the video is played.

Value must be `0` or `1`.

### retro3Link

Hide retro3 instance link in control bar.

Value must be `0` or `1`.

### muted

Mute the video by default.

Value must be `0` or `1`.

### loop

Automatically start again the video when it ends.

Value must be `0` or `1`.

### subtitle

Auto select a subtitle by default.

Value must be a valid subtitle ISO code (`fr`, `en`, etc.).

### autoplay

Try to automatically play the video.
Most web browsers disable video autoplay if the user did not interact with the video. You can try to bypass this limitation by muting the video

Value must be `0` or `1`.

### playbackRate

Force the default playback rate (`0.75`, `1.5` etc).

### title

Hide embed title.

Value must be `0` or `1`.

### warningTitle

Hide P2P warning title.

Value must be `0` or `1`.

### p2p

Disable P2P.

Value must be `0` or `1`.

### bigPlayBackgroundColor

Customize big play button background color.

Value must be a valid color (`red` or `rgba(100, 100, 100, 0.5)`).

### foregroundColor

Customize embed font color.

Value must be a valid color (`red` or `rgba(100, 100, 100, 0.5)`).

### mode

Force a specific player engine.

Value must be a valid mode (`web-video` or `p2p-media-loader`).

### api

Enable embed JavaScript API (see methods below).

Value must be `0` or `1`.

### waitPasswordFromEmbedAPI

**retro3 >= 6.0**

If the video requires a password, retro3 will wait a password provided by `setVideoPassword` method before loading the video.

Until you provide a password, `player.ready` is not resolved.


## Embed attributes

### `ready: Promise<void>`

This promise is resolved when the video is loaded an the player is ready.


## Embed methods

### `play() : Promise<void>`

Starts playback, or resumes playback if it is paused.

### `pause() : Promise<void>`

Pauses playback.

### `seek(positionInSeconds : number)`

Seek to the given position, as specified in seconds into the video.

### `addEventListener(eventName : string, handler : Function)`

Add a listener for a specific event. See below for the available events.

### `removeEventListener(eventName : string, handler : Function)`

Remove a listener.

### `getResolutions() : Promise<retro3Resolution[]>`

Get the available resolutions. A `retro3Resolution` looks like:

```json
{
    "id": 3,
    "label": "720p",
    "height": "720",
    "active": true
}
```

`active` is true if the resolution is the currently selected resolution.

### `setResolution(resolutionId : number): Promise<void>`

Change the current resolution. Pass `-1` for automatic resolution (when available).
Otherwise, `resolutionId` should be the ID of an object returned by `getResolutions()`

### `getPlaybackRates() : Promise<number[]>`

Get the available playback rates, where `1` represents normal speed, `0.5` is half speed, `2` is double speed, etc.

### `getPlaybackRates() : Promise<number>`

Get the current playback rate. See `getPlaybackRates()` for more information.

### `setPlaybackRate(rate: number) : Promise<void>`

Set the current playback rate. The passed rate should be a value as returned by `getPlaybackRates()`.

### `setVolume(factor: number) : Promise<void>`

Set the playback volume. Value should be between `0` and `1`.

### `getVolume(): Promise<number>`

Get the playback volume. Returns a value between `0` and `1`.

### `setCaption(id: string) : Promise<void>`

Update current caption using the caption id.

### `getCaptions(): Promise<{ id: string, label: string, src: string, mode: 'disabled' | 'showing' }>`

Get video captions.

### `playNextVideo(): Promise<void>`

Play next video in playlist.

### `playPreviousVideo(): Promise<void>`

Play previous video in playlist.

### `getCurrentPosition(): Promise<void>`

Get current position in playlist (starts from 1).


### `setVideoPassword(): Promise<void>`

**retro3 >= 6.0**

Set the video password so the user doesn't have to manually fill it.
`waitPasswordFromEmbedAPI=1` is required in embed URL.


## Embed events

You can subscribe to events by using `addEventListener()`. See above for details.

### Event `playbackStatusUpdate`

Fired every half second to provide the current status of playback.
The parameter of the callback will resemble:

```json
{
  "position": 22.3,
  "volume": 0.9,
  "duration": "171.37499",
  "playbackState": "playing"
}
```

`duration` field and `ended` `playbackState` are available in retro3 >= 2.2.

The `volume` field contains the volume from `0` (silent) to `1` (full volume).
The `playbackState` can be `unstarted`, `playing`, `paused` or `ended`. More states may be added later.

### Event `playbackStatusChange`

Fired when playback transitions between states, such as `paused` and `playing`. More states may be added later.

### Event `resolutionUpdate`

Fired when the available resolutions have changed, or when the currently selected resolution has changed. Listener should call `getResolutions()` to get the updated information.

### Event `volumeChange`

Fired when the player volume changed.
