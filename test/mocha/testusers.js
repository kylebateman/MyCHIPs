//Setup sample users for tests; Run after impexp and before tally tests
//Copyright MyCHIPs.org; See license in root of this package
// -----------------------------------------------------------------------------
//TODO:
//- 
const { dbConf, testLog, Format, Bus, assert, dbClient, Crypto } = require('./common')
var log = testLog(__filename)
var crypto = new Crypto(log)
var { host, user0, user1, port0, port1, agent0, agent1, aCon0, aCon1, cid0, cid1 } = require('./def-users')
var interTest = {}

describe("Establish test users", function() {
  var db

  before('Connection to database', function(done) {
    db = new dbClient(new dbConf(), () => {}, ()=>{done()})
  })

  it("Build User Keys", function(done) {
    let dc = 2, _done = () => {if (!--dc) done()}	//dc _done's to be done
    crypto.generate((keyPair, private, public) => {	//log.debug('key0:', private)
      assert.ok(keyPair.publicKey)
      assert.ok(keyPair.privateKey)
      assert.ok(public.x)
      assert.ok(public.y)
      interTest.uKey0 = public
      interTest.rKey0 = JSON.stringify(private)		//Stash private key in user's comment
      _done()
    })
    crypto.generate((keyPair, private, public) => {	//log.debug('key1:', public)
      interTest.uKey1 = public
      interTest.rKey1 = JSON.stringify(private)
      _done()
    })
  })
  
  it("Initialize test users", function(done) {
//log.debug("Key:", agent0.key.publicKey)
    let fields = 'peer_host = %L, peer_port=%L, peer_agent=%L, peer_psig=%L, user_cmt=%L'
      , f0 = Format(fields, host, port0, agent0, interTest.uKey0, interTest.rKey0)
      , f1 = Format(fields, host, port1, agent1, interTest.uKey1, interTest.rKey1)
      , sql = `begin;
        delete from base.ent where ent_num > 1001;
        delete from mychips.tallies;
        update mychips.users set _last_tally = 0;
        update mychips.users_v set ${f0} where user_ent = '${user0}';
        update mychips.users_v set ${f1} where user_ent = '${user1}';
        select count(*) as count from mychips.users_v where ent_num >= 1000; commit;`
//log.debug("Sql:", sql)
    db.query(sql, (err, res) => {if (err) done(err)
      assert.equal(res.length, 8)	//8: begin, del, del, upd, upd, upd, select, commit
//log.debug("Res:", res[6].rows[0])
      let row = res[6].rows[0]
log.info("Users:", row.count)
      assert.equal(row.count,2)
      done()
    })
  })
/* */
  after('Disconnect from test database', function(done) {
    setTimeout(()=>{
      db.disconnect()
      }, 200)
    done()
  })
});
