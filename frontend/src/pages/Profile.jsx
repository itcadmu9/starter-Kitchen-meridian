import { useAuth } from '../hooks/useAuth'

export default function Profile() {
  const { user, logout } = useAuth()

  return (
    <div className="page">
      <h1>Profile</h1>
      {user ? (
        <>
          <p>Signed in as {user.email}</p>
          <button type="button" onClick={logout}>
            Log out
          </button>
        </>
      ) : (
        <p>Not signed in.</p>
      )}
    </div>
  )
}
