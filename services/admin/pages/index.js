
import Page from '../../../models/page';
import {sendData} from '../../../services';
const debug = require('debug')('Routes:AdminPageCRUD');

// ----------------------------------------------------------------------------
// Admin Pages CRUD
// ----------------------------------------------------------------------------

export function redirectPage(req, res) {
  res.redirect('/admin/pages/page/20/1');
}

export function createPage(req, res, next) {
  debug('CREATING PAGE');
  req.body.user = req.user;
  Page.create(req.body, (error, page) => {
    let data = {};
    if (error) {
      data = {
        success: false,
        error
      };
      debug('Creation error');
    } else {
      data = {
        success: {
          message: `"${page.title}" creation successfully`
        },
        page
      };
    }
    sendData({data, req, res, next});
  });
}

export function getPages(req, res, next) {
  const {perpage, currentPageNumber} = req.params;
  debug(req.query.s);
  const {s: search, sort} = req.query;

  let filter = {}, data;
  if (search) {
    filter = {
      $or: [
        {'title': new RegExp(search, 'i')},
        {'content': new RegExp(search, 'i')}
      ]
    };
  }

  let sortCriteria = {};
  if (sort) {
    let sortAndDirection = sort.split('|'),
      sortTerm = sortAndDirection[0],
      sortDirection = sortAndDirection[1];

    const sortValue = sortDirection === 'asc' ? 1 : -1;
    sortCriteria = {
      [sortTerm]: sortValue
    };
  }

  // TODO use generators + Promises for multiple async
  // http://davidwalsh.name/async-generators
  Page.count(filter, (countError, totalPages) => {
    if (countError) {
      data = {
        success: false,
        error: countError
      };
      sendData({data, req, res, next});
    } else {
      if (totalPages < currentPageNumber * perpage) {

        // A search or filter query has deemed this page empty,
        // but let's return results and tell the client to update
        // the page number in the URL instead of redirecting or failing.
        var newPageNumber = Math.floor(totalPages / Number(perpage) + 1);
        debug('adjusting...', totalPages, Number(perpage), newPageNumber);
        var pageAdjustment = newPageNumber;
      }
      const pageNumber = newPageNumber || Number(currentPageNumber);
      Page.find(filter)
        .populate('user')
        .limit(perpage)
        .skip((pageNumber - 1) * perpage)
        .sort(sortCriteria)
        .exec((paginateError, pages) => {

        if (paginateError) {
          data = {
            success: false,
            error: paginateError
          };

        } else {
          data = {
            success: true,
            perpage: Number(perpage),
            currentPageNumber: pageNumber,
            search: req.query.s,
            pages,
            totalPages,
            pageAdjustment
          };
        }
        sendData({data, req, res, next});
      });
    }

  });
}

export function getOnePage(req, res, next) {
  debug('GETTING PAGE');
  if (req.params.id === 'create') {
    const data = {
      success: true
    };
    sendData({data, req, res, next});
  } else {
    Page.findOne({_id: req.params.id}, (error, page) => {
      let data;
      if (error) {
        data = {
          success: false,
          error
        };
        debug('PAGE ERROR', error);
        sendData({data, req, res, next});
      } else {
        if (!page) {
          data = {
            success: false,
            error: `No page found for ${req.params.id}`
          };
        } else {
          data = page;
          data.success = true;
        }
        debug('PAGE DATA', data);
        sendData({data, req, res, next});
      }
    });
  }
}


export function updatePage(req, res, next) {
  debug('SETTING PAGE');

  Page.findOneAndUpdate(
    {_id: req.params.id},
    req.body,
    {'new': true},
    (error, page) => {
      let data;
      if (error) {
        data = {
          error,
          success: false
        };
        debug('PAGE ERROR', error);
        sendData({data, req, res, next});
      } else {
        if (!page) {
          data = {
            success: false,
            error: `No page found for ${req.params.id}`
          };
        } else {
          data = {
            page,
            success: {
              message: `${page.title} saved successfully.`
            }
          };
        }
        sendData({data, req, res, next});
      }
    });
}
export function updateManyPages(req, res, next) {
  debug('SETTING PAGE');
  const {items, formValues} = req.body;

  Page.update(
    {_id: {$in: items}},
    formValues,
    {
      'new': true,
       multi: true
    },
    (error, page) => {
      let data;
      if (error) {
        data = {
          error,
          success: false
        };
        debug('PAGE ERROR', error);
        sendData({data, req, res, next});
      } else {
        if (!page) {
          data = {
            success: false,
            error: `No page found for ${req.params.id}`
          };
        } else {
          data = {
            page,
            success: {
              message: `Updated all records.`
            }
          };
        }
        sendData({data, req, res, next});
      }
    });
}

export function deletePage(req, res, next) {
  debug('DELETING PAGE');
  Page.findByIdAndRemove(req.params.id, (error, page) => {
    let data = {};
    if (error) {
      data = {
        success: false,
        error
      };
      debug('Deletion error');
    } else {
      data = {
        success: {
          message: `"${page.title}" deleted successfully`
        },
        page
      };
    }
    sendData({data, req, res, next});
  });
}
