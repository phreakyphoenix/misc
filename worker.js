// keep track of all our blog endpoints here
const myBlog = {
  hostname: "blog.aitranscriber.tech",
  targetSubdirectory: "/blog",
  assetsPathnames: ["/_next/", "/js/", '/api/', '_axiom', '/ping/'] 
}

//set route *aitranscriber.tech/*
async function handleRequest(request) {
    const parsedUrl = new URL(request.url)
    const requestMatches = match => new RegExp(match).test(parsedUrl.pathname)
    
    if (request.method === 'POST') {
      return MethodNotAllowed(request);
      // console.log(`https://blog.aitranscriber.tech${parsedUrl.pathname}`);
      // return fetch(`https://blog.aitranscriber.tech${parsedUrl.pathname}`)
    }
      
    // else method is GET

    // if its blog html, get it
    if (requestMatches(myBlog.targetSubdirectory)) {
      console.log("this is a request for a blog document", parsedUrl.pathname);

      const pruned = parsedUrl.pathname.split("/").filter(part => part);
      // // Drop the first element from the path if it matches the target subdirectory
      // // console.log(pruned[0])
      // targetPath = pruned.length > 1 ? `${pruned.slice(1).join("/")}` : "";
      // // console.log(targetPath);
      // // console.log(`https://${myBlog.hostname}/${targetPath}`)
      // var res = await(fetch(`https://${myBlog.hostname}/${targetPath}`));
      // res = htmlrewriter.transform(res);
      // console.log(pruned.length);
      // res = scriptadder.transform (res);
      // // console.log(res)
      // return res
      if (parsedUrl.pathname.startsWith('/blog/newsletter')){
        return scriptadder.transform (htmlrewriter.transform(await(fetch(`https://${myBlog.hostname}/${pruned.slice(1).join("/")}`))));
      }
      if (pruned.length==1){
        return scriptadder.transform (htmlrewriter.transform(await(fetch(`https://${myBlog.hostname}`))));
      }
      else{
        return htmlrewriter.transform(await(fetch(`https://${myBlog.hostname}/${pruned.slice(1).join("/")}`)));
      }
    }

    // if its blog assets, get them
    else if (myBlog.assetsPathnames.some(requestMatches)) {
      console.log("this is a request for other blog assets", parsedUrl.pathname)
      const assetUrl = request.url.replace(parsedUrl.hostname, myBlog.hostname);
      console.log(assetUrl)
      return fetch(assetUrl)
    }

    console.log("this is a request to my root domain", parsedUrl.host, parsedUrl.pathname);
    // if its not a request blog related stuff, do nothing
    return fetch(request)
  }
// }

class AttributeRewriter {
  constructor(attributeName) {
    this.attributeName = attributeName;
  }
  element(element) {
    const attribute = element.getAttribute(this.attributeName);
    //add check for /blog start for nested scenarios
    if (attribute && !attribute.startsWith('https://')) 
    {
      element.setAttribute(this.attributeName, '/blog'+attribute);
    }
  }
}

class ScriptAdder {
  element(element) {
      element.prepend('<script>function o(){location.href!=a&&(location.replace("/blog"+location.pathname),a=location.href)}var a=location.href;setInterval(o,100);</script>',{html: true});
  }
}

const htmlrewriter = new HTMLRewriter()
  .on('a', new AttributeRewriter('href'))
  // .on('img', new AttributeRewriter('src'));

const scriptadder = new HTMLRewriter()
  .on('head', new ScriptAdder())

function MethodNotAllowed(request) {
  return new Response(`Method ${request.method} not allowed.`, {
    status: 405,
    headers: {
      Allow: 'GET',
    },
  });
}

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})
