import update from "immutability-helper";

export function getCommandsFlat( groups ) {
  return Object.values( groups ).reduce( ( carry, group ) => {
    const commands = Object.values( group.tests ).reduce( ( carry, test ) => {
      return carry.concat( Object.values( test.commands ) );
    }, []);
    return carry.concat( commands );
  }, []);
}

export function getTestsFlat( groups ) {
  return Object.values( groups ).reduce( ( carry, group ) => {
    return carry.concat( Object.values( group.tests ) );
  }, []);
}

function arrayToMap( array ) {

  return array.reduce( ( carry, entry ) => {
    carry[ entry.id ] = { ...entry };
    return carry;
  }, {});
}

export function removeMapEntry( map, id ) {
  return arrayToMap( Object.values( map ).filter( entry => entry.id !== id ) );
}

export function appendMapEntry( map, targetEntry ) {
  return arrayToMap([ targetEntry, ...Object.values( map ) ]);
}

export function transferTest( state, sourceTest, targetTest ) {

  return update( state, {
    suite: {
      groups: {
        // remove
        [ sourceTest.groupId ]: {
          tests: {
            $set: removeMapEntry( state.suite.groups[ sourceTest.groupId ].tests, sourceTest.id )
          }
        },
        // add
        [ targetTest.groupId ]: {
          tests: {
            $set: appendMapEntry( state.suite.groups[ targetTest.groupId ].tests, sourceTest )
          }
        }
      }
    }});
}

export function transferCommand( state, sourceCommand, targetCommand ) {
  const sourceCommands = state.suite.groups[ sourceCommand.groupId ].tests[ sourceCommand.testId ].commands,
        targetCommands = state.suite.groups[ targetCommand.groupId ].tests[ targetCommand.testId ].commands,

        temp = update( state, {
          suite: {
            groups: {
              // remove
              [ sourceCommand.groupId ]: {
                tests: {
                  [ sourceCommand.testId ]: {
                    commands: {
                      $set: removeMapEntry( sourceCommands, sourceCommand.id )
                    }
                  }
                }
              }
            }
          }});

  return update( temp, {
    suite: {
      groups: {
        // add
        [ targetCommand.groupId ]: {
          tests: {
            [ targetCommand.testId ]: {
              commands: {
                $set: appendMapEntry( targetCommands, sourceCommand )
              }
            }
          }
        }
      }
    }});
}