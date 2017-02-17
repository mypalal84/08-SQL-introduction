'use strict';

function Article (opts) {
  // REVIEW: Convert property assignment to a new pattern. Now, ALL properties of `opts` will be
  // assigned as properies of the newly created article object. We'll talk more about forEach() soon!
  // We need to do this so that our Article objects, created from DB records, will have all of the DB columns as properties (i.e. article_id, author_id...)
  Object.keys(opts).forEach(function(e) {
    this[e] = opts[e]
  }, this);
}

Article.all = [];

// ++++++++++++++++++++++++++++++++++++++

// REVIEW: We will be writing documentation today for the methods in this file that handles Model layer of our application. As an example, here is documentation for Article.prototype.toHtml(). You will provide documentation for the other methods in this file in the same structure as the following example. In addition, where there are TODO comment lines inside of the method, describe what the following code is doing (down to the next TODO) and change the TODO into a DONE when finished.

/**
 * OVERVIEW of Article.prototype.toHtml():
 * - A method on each instance that converts raw article data into HTML
 * - Inputs: nothing passed in; called on an instance of Article (this)
 * - Outputs: HTML of a rendered article template
 */
Article.prototype.toHtml = function() {
  // DONE: Retrieves the  article template from the DOM and passes the template as an argument to the Handlebars compile() method, with the resulting function being stored into a variable called 'template'.
  var template = Handlebars.compile($('#article-template').text());

  // DONE: Creates a property called 'daysAgo' on an Article instance and assigns to it the number value of the days between today and the date of article publication
  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // DONE: Creates a property called 'publishStatus' that will hold one of two possible values: if the article has been published (as indicated by the check box in the form in new.html), it will be the number of days since publication as calculated in the prior line; if the article has not been published and is still a draft, it will set the value of 'publishStatus' to the string '(draft)'
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';

  // DONE: Assigns into this.body the output of calling marked() on this.body, which converts any Markdown formatted text into HTML, and allows existing HTML to pass through unchanged
  this.body = marked(this.body);

// DONE: Output of this method: the instance of Article is passed through the template() function to convert the raw data, whether from a data file or from the input form, into the article template HTML
  return template(this);
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - A method of Article that instantiates all the articles based on their publishedOn Date. It loads all the data into the Article.all array
 * - Inputs: the rows parameter which is an array of data coming from /articles.
 * - Outputs: all the rows of Article stored in an array attached to Article.
 */
Article.loadAll = function(rows) {
  // DONE: rows is a parameter, and the sort method in this case will take 2 instances of a publishedOn date. the callback function will return the difference between the published on dates of a and b. the callback function will be called when rows.sort executes. it returns a Date object.
  rows.sort(function(a,b) {
    return (new Date(b.publishedOn)) - (new Date(a.publishedOn));
  });

  // forEach will iterate through all of the rows. the callback function will then take all the new Article data for each row, and push into the Article.all aray. rows is an array of Article objects. callback function is invoked when rows.forEach executes.  ele is a placeholder parameter that refers to the "elements" within an array.
  rows.forEach(function(ele) {
    Article.all.push(new Article(ele));
  })
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - this method will retrieve the data from either a local or remote source, depending on if it exists in the database. if data exists, Article.loadAll will execute. if not, it will get it from hackerIpsum.json(data folder) and add it to the database. it will keep calling itself as long as there are things to be imported.
 * - Inputs: callback function of the articleView.initIndexPage method, which is in the articleView.js file and is invoked at the end of the index.html page
 * - Outputs: identify any outputs and their destination?????
 */
Article.fetchAll = function(callback) {
  // DONE: ajax call to get data from /articles in server.js
  $.get('/articles')
  // DONE: after ajax call, run a function with the parameter results(records in the database). if results exist: {
  .then(
    function(results) {
      if (results.length) { // If records exist in the DB
        // DONE: load all of the records that exist in the database, then invoke callback
        Article.loadAll(results);
        callback();//calls initIndexPage
      } else { // if NO records exist in the DB
        // DONE: ajax call to getJSON raw data from hackerIpsum.json. then the forEach method will iterate through the raw data, then i need help explaining the rest of this?????
        $.getJSON('./data/hackerIpsum.json')
        .then(function(rawData) {
          rawData.forEach(function(item) {
            let article = new Article(item);
            article.insertRecord(); // Add each record to the DB
          })
        })
        // DONE: The fetchAll method calls itself. it will do this until the if statement is true.
        .then(function() {
          Article.fetchAll(callback);
        })
        // DONE: throw an error message if the if and else statements both fail?????
        .catch(function(err) {
          console.error(err);
        });
      }
    }
  )
};

// ++++++++++++++++++++++++++++++++++++++

// TODO
/**
 * OVERVIEW of
 * - Deletes all of the data in the table
 * - Inputs: callback(placeholder parameter)
 * - Outputs: identify any outputs and their destination?????
 */
Article.truncateTable = function(callback) {
  // DONE: ajax request to server.js to the url of articles with the method of delete. The app.delete method will then be called.
  $.ajax({
    url: '/articles',
    method: 'DELETE',
  })
  // DONE: after the ajax request, this is going to log to the console that the table was deleted.
  .then(function(data) {
    console.log(data);
    if (callback) callback();//if there's a callback, run callback
  });
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - A post method of Article that inserts a new instance of Article to the table, then logs it to the console
 * - Inputs: possible callback
 * - Outputs: a log to the console of the data inserted to the table
 */
Article.prototype.insertRecord = function(callback) {
  // DONE: ajax call to post an instance of Article to /articles filepath
  $.post('/articles', {author: this.author, authorUrl: this.authorUrl, body: this.body, category: this.category, publishedOn: this.publishedOn, title: this.title})
  // DONE: after the ajax call, the posted article will be logged to the console. if theres a callback, run callback()
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  })
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - This method will delete a specific article by id. It will then log that information to the console.
 * - Inputs: possible callback, this.article_id
 * - Outputs: removal of article and logging that to the console
 */
Article.prototype.deleteRecord = function(callback) {
  // DONE: ajax call to delete an article with this.article_id
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'DELETE'
  })
  // DONE: after the ajax call and deletion, that deletion will be logged to the console. if theres a callback, run callback()
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  });
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - This method will update a specific record by using the put method on a specific article with an id.
 * - Inputs: possible callback, article id, data
 * - Outputs: updated table data
 */
Article.prototype.updateRecord = function(callback) {
  // DONE: ajax call. uses the put method on this article instance's id.
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'PUT',
    data: {  // DONE: taking in the new information and adding as a new instance
      author: this.author,
      authorUrl: this.authorUrl,
      body: this.body,
      category: this.category,
      publishedOn: this.publishedOn,
      title: this.title
    }
  })
  // DONE: after the information is added, log that to the console. if theres a callback, run callback()
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  });
};
