var db = new PouchDB('shopping');

export default {
  data() {
    return {
      mode: 'showlist',
      pagetitle: 'Shopping Lists',
      shoppingLists: [],
      shoppingListItems: [],
      singleList: null,
      currentListId: null,
      newItemTitle:'',
      places: [],
      selectedPlace: null,
      syncURL:'',
      syncStatus: 'notsyncing'
    }
  },
  computed: {
    counts() {
      var obj = {};
      for(var i in this.shoppingListItems) {
        var d = this.shoppingListItems[i];
        if (!obj[d.list]) {
          obj[d.list] = { total: 0, checked: 0};
        }
        obj[d.list].total++;
        if (d.checked) {
          obj[d.list].checked++;
        }
      }
      return obj;
    },
    sortedShoppingLists() {
      return this.shoppingLists.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    sortedShoppingListItems() {
      return this.shoppingListItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },
  mounted() {
    db.createIndex({ index: { fields: ['type'] }}).then(() => {
      var q = {
        selector: {
          type: 'list'
        }
      };
      return db.find(q);
    }).then((data) => {
      this.shoppingLists = data.docs;

      var q = {
        selector: {
          type: 'item'
        }
      };
      return db.find(q);
    }).then((data) => {
      this.shoppingListItems = data.docs;

      return db.get('_local/user');
    }).then((data) => {
      this.syncURL = data.syncURL;
      this.startSync();
    }).catch((e) => {})
  },
  methods: {
    onClickSettings() {
      this.mode = 'settings';
    },
    onClickAbout() {
      this.mode = 'about';
    },
    saveLocalDoc(doc) {
      return db.get(doc._id).then((data) => {
        doc._rev = data._rev;
        return db.put(doc);
      }).catch((e) => {
        return db.put(doc);
      });
    },
    onClickStartSync() {
      var obj = {
        '_id': '_local/user',
        'syncURL': this.syncURL
      };
      this.saveLocalDoc(obj).then( () => {
        this.startSync();
      });
    },
    startSync() {
      this.syncStatus = 'notsyncing';
      if (this.sync) {
        this.sync.cancel();
        this.sync = null;
      }
      if (!this.syncURL) { return; }
      this.syncStatus = 'syncing';
      this.sync = db.sync(this.syncURL, {
        live: true,
        retry: false
      }).on('change', (info) => {
        if (info.direction == 'pull' && info.change && info.change.docs) {
          for(var i in info.change.docs) {
            var change = info.change.docs[i];
            var arr = null;

            if (change._id.match(/^item/)) {
              arr = this.shoppingListItems;
            } else if (change._id.match(/^list/)) {
              arr = this.shoppingLists;
            } else {
              continue;
            }

            var match = this.findDoc(arr, change._id);

            if (match.doc) {
              if (change._deleted == true) {
                arr.splice(match.i, 1);
              } else {
                delete change._revisions;
                this.$set(arr, match.i, change);
              }
            } else {
              if (!change._deleted) {
                arr.unshift(change);
              }
            }
          }
        }
      }).on('error', (e) => {
        this.syncStatus = 'syncerror';
      }).on('denied', (e) => {
        this.syncStatus = 'syncerror';
      }).on('paused', (e) => {
        if (e) {
          this.syncStatus = 'syncerror';
        }
      });
    },
    findDoc(docs, id, key) {
      if (!key) {
        key = '_id';
      }
      var doc = null;
      for(var i in docs) {
        if (docs[i][key] == id) {
          doc = docs[i];
          break;
        }
      }
      return { i: i, doc: doc };
    },
    findUpdateDoc(docs, id) {
      var doc = this.findDoc(docs, id).doc;

      if (doc) {
        doc.updatedAt = new Date().toISOString();

        this.$nextTick(() => {
          db.put(doc).then((data) => {
            doc._rev = data.rev;
          });
        });
      }
    },
    onClickAddShoppingList() {
      this.singleList = JSON.parse(JSON.stringify(sampleShoppingList));
      this.singleList._id = 'list:' + cuid();
      this.singleList.createdAt = new Date().toISOString();
      this.pagetitle = 'New Shopping List';
      this.places = [];
      this.selectedPlace = null;
      this.mode='addlist';
    },
    onClickSaveShoppingList() {
      this.singleList.updatedAt = new Date().toISOString();

      if (typeof this.singleList._rev === 'undefined') {
        this.shoppingLists.unshift(this.singleList);
      }
      
      db.put(this.singleList).then((data) => {
        this.singleList._rev = data.rev;

        this.onBack();
      });
    },
    onBack() {
      this.mode='showlist';
      this.pagetitle='Shopping Lists';
    },
    onClickEdit(id, title) {
      this.singleList = this.findDoc(this.shoppingLists, id).doc;
      this.pagetitle = 'Edit - ' + title;
      this.places = [];
      this.selectedPlace = null;
      this.mode='addlist';
    },
    onClickDelete(id) {
      var match = this.findDoc(this.shoppingLists, id);
      db.remove(match.doc).then(() => {
        this.shoppingLists.splice(match.i, 1);
      });
    },
    onClickList(id, title) {
      this.currentListId = id;
      this.pagetitle = title;
      this.mode = 'itemedit';
    },
    onAddListItem() {
      if (!this.newItemTitle) return;
      var obj = JSON.parse(JSON.stringify(sampleListItem));
      obj._id = 'item:' + cuid();
      obj.title = this.newItemTitle;
      obj.list = this.currentListId;
      obj.createdAt = new Date().toISOString();
      obj.updatedAt = new Date().toISOString();
      db.put(obj).then( (data) => {
        obj._rev = data.rev;
        this.shoppingListItems.unshift(obj);
        this.newItemTitle = '';
      });
    },
    onCheckListItem(id) {
      this.findUpdateDoc(this.shoppingListItems, id);
    },
    onClickLookup() {
      var url = 'https://nominatim.openstreetmap.org/search';
      var qs = {
        format: 'json',
        addressdetails: 1, 
        namedetails: 1,
        q: this.singleList.place.title
      };
      ajax(url, qs).then((d) => {
        this.places = d;

        if (d.length ==1) {
          this.onChangePlace(d[0].place_id);
        }
      });
    },
    onChangePlace(v) {
      var doc = this.findDoc(this.places, v, 'place_id').doc;
      this.singleList.place.lat = doc.lat;
      this.singleList.place.lon = doc.lon;
      this.singleList.place.license = doc.licence;
      this.singleList.place.address = doc.address;
    },
    onDeleteItem(id) {
      var match = this.findDoc(this.shoppingListItems, id);
      db.remove(match.doc).then((data) => {
        this.shoppingListItems.splice(match.i, 1);
      });
    }
  }
}
