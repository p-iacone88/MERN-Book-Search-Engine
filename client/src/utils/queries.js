// from Activity 26 in MERN
import { gql } from '@apollo/client';
// GraphQL query to fetch current user's info
export const GET_ME = gql`
{
  me {
    _id
    username
    email
    bookCount
    savedBooks {
      bookId
      authors
      description
      title
      image
      link
    }
  }
}
`;