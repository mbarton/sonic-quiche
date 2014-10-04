with_tempo 350

2.times do
    play_pattern [40,25,45,25,25,50,50]
    play_pattern [25,50,25,30,35,40,45,50]
    play_pattern [25,50,25,30,35,40,45,50].reverse
end

2.times do
    with_synth "saw_beep"
    play_pattern [25,50,25,30,35,40,45,50].shuffle
    play_pattern [25,50,25,30,35,40,45,50].reverse
end

play_pad "saws", 37

in_thread do
    with_synth "saw_beep"
    10.times do
        if rand < 0.5
            play 37
        else
            play 49
        end
    sleep 2 end
end

in_thread do
    with_synth "pretty_bell"
    20.times do
        play 49
    sleep 1 end
end