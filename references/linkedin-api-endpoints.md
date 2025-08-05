Endpoints

Endpoints

Header helper button
Sign In with LinkedIn using OpenID Connect endpoints

GET https://api.linkedin.com/v2/userinfo
Authorization: Bearer <access token>
Product version: 
Unversioned
Product API endpoints
Resource
Method
OAuth Scopes
Permission Types
Search
Search
Search
Search
/v2/userinfo	GET	openid	
Member (3-legged)

Header helper button
Share on LinkedIn endpoints
Product version: 
202401
Product API endpoints
Resource
Method
OAuth Scopes
Permission Types

/rest/documents	BATCH_GET	w_member_social	
Member (3-legged)
/rest/documents	ACTION
initializeUpload
w_member_social	
Member (3-legged)
/rest/documents	FINDER
associatedAccount
w_member_social	
Member (3-legged)
/rest/documents/{documentId}	GET	w_member_social	
Member (3-legged)
/rest/images	BATCH_GET	w_member_social	
Member (3-legged)
/rest/images	ACTION
initializeUpload
w_member_social	
Member (3-legged)
/rest/images/{imageId}	GET	w_member_social	
Member (3-legged)
/rest/images/{imageId}	PARTIAL_UPDATE	w_member_social	
Member (3-legged)
/rest/posts	CREATE	w_member_social	
Member (3-legged)
/rest/posts/{postUrn}	DELETE	w_member_social	
Member (3-legged)
/rest/posts/{postUrn}	PARTIAL_UPDATE	w_member_social	
Member (3-legged)
/rest/reactions/{id}	DELETE	w_member_social	
Member (3-legged)
/rest/reactions/{id}	PARTIAL_UPDATE	w_member_social	
Member (3-legged)
/rest/reactions/{id}	FINDER
entity
w_member_social	
Member (3-legged)
/rest/videos	BATCH_GET	w_member_social	
Member (3-legged)
/rest/videos	ACTION
initializeUpload
w_member_social	
Member (3-legged)

/rest/videos	ACTION
finalizeUpload
w_member_social	
Member (3-legged)
/rest/videos/{videoId}	GET	w_member_social	
Member (3-legged)
/rest/videos/{videoId}	PARTIAL_UPDATE	w_member_social	
Member (3-legged)