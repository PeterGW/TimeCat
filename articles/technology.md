### How it works

If you like playing games,  Warcraft 3 must be on that list. You may be curious about the video files exported by the game-why the video is only a few hundred KB even after you have played the game for an hour?  Soon you will realize what have a happened-the map inside the game has to be reloaded almost every time when you import the replay video. If you skip the step, the video won’t be played

Actually the data recorded in the video is not a video file, but a series of actions come up with time stamps. When importing the map, you actually initialize a state. In this state, once the previous actions are restored,  you can restore the whole previous game process. This is what we called the basic principle of the Reply

This actually draws on such an idea, using this way to record a video that is not essentially a video, but can be played like a real video.

By recording a series of browser event data and using the browser engine to re-render it, the previous operation process is restored, and the operation animation of the web page is also restored

### Technical Implementation

The TimeCat project is divided into two main modules, Recorder and Player, which are responsible for recording and restoring action data respectively.

#### Recorder
Recorder is a user action recorder that uses the browser's native event API and data hijacking to map all the changes inside the web page during the browser operation into corresponding data, including different types of data such as Canvas, DOM, Font, CSS, Audio, etc., and store them persistently in the browser storage space

#### Player

Player is a special player that reverts the special data generated by Recorder and renders it into a Web page, executing each frame of action data in chronological order to produce animation. while Player also implements skip, fast forward, export, full screen, etc., making it close to the real video player operation mode

##### [🏠Homepage](../README.md) 