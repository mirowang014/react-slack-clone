import Chatkit from '@pusher/chatkit-client'

const credentials = {
  url: (id, token) =>
    `https://us1.pusherplatform.io/services/chatkit_token_provider/v1/13e46e6f-a104-454d-85d1-0ac1f59258a2/token`,
  instanceLocator: 'v1:us1:13e46e6f-a104-454d-85d1-0ac1f59258a2',
}

const { instanceLocator, url } = credentials
export default ({ state, actions }, { id, token }) =>
  new Chatkit.ChatManager({
    tokenProvider: new Chatkit.TokenProvider({ url: url(id, token) }),
    instanceLocator,
    userId: id,
  })
    .connect({
      onUserStartedTyping: actions.isTyping,
      onUserStoppedTyping: actions.notTyping,
      onAddedToRoom: actions.subscribeToRoom,
      onRemovedFromRoom: actions.removeRoom,
      onPresenceChanged: actions.setUserPresence,
    })
    .then(user => {
      // Subscribe to all rooms the user is a member of
      Promise.all(
        user.rooms.map(room =>
          user.subscribeToRoom({
            roomId: room.id,
            hooks: { onMessage: actions.addMessage },
          })
        )
      ).then(rooms => {
        actions.setUser(user)
        // Join the first room in the users room list
        user.rooms.length > 0 && actions.joinRoom(user.rooms[0])
      })
    })
    .catch(error => console.log('Error on connection', error))
