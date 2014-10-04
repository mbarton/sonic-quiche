print "Main Thread"

in_thread do
    print "Thread One"
end

in_thread do
    print "Thread Two"
end

print "Main Thread Again"